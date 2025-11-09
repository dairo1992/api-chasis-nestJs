import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { AuditLogsService } from '../../features/audit-logs/audit-logs.service';
import { AuditLogStatus } from 'src/features/audit-logs/entities/audit-log.entity';

// Enum para las acciones de auditoría
enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
}

// Mapeo de métodos HTTP a acciones
const HTTP_METHOD_TO_ACTION: Record<string, AuditAction> = {
  POST: AuditAction.CREATE,
  PUT: AuditAction.UPDATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
  GET: AuditAction.READ,
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, user, params } = request;

    // Determinar la acción basada en el método HTTP
    const action = HTTP_METHOD_TO_ACTION[method] ?? AuditAction.READ;

    // Solo registrar mutaciones (CREATE, UPDATE, DELETE)
    if (action === AuditAction.READ) {
      return next.handle();
    }

    // Extraer información del recurso
    const resourceInfo = this.extractResourceInfo(url);

    return next.handle().pipe(
      tap({
        next: (response) => {
          // Registrar auditoría de forma asíncrona sin bloquear la respuesta
          this.logAudit(request, action, resourceInfo, body, response).catch(
            (error) => {
              this.logger.error(
                `Error al registrar auditoría: ${error.message}`,
                error.stack,
              );
            },
          );
        },
      }),
      catchError((error) => {
        // Registrar intentos fallidos también
        this.logFailedAudit(request, action, resourceInfo, body, error).catch(
          (auditError) => {
            this.logger.error(
              `Error al registrar auditoría fallida: ${auditError.message}`,
              auditError.stack,
            );
          },
        );
        return throwError(() => error);
      }),
    );
  }

  /**
   * Extrae información del recurso desde la URL
   */
  private extractResourceInfo(url: string): {
    resourceType: string;
    endpoint: string;
  } {
    const urlParts = url.split('/').filter(Boolean);
    const queryIndex = urlParts[urlParts.length - 1]?.indexOf('?');

    let resourceType = '';
    let endpoint = '';

    if (urlParts.length > 2) {
      resourceType = urlParts[2]?.split('?')[0] || '';
      endpoint = urlParts[3] ?? '';

      // Limpiar query params del endpoint
      if (queryIndex !== -1) {
        endpoint = endpoint.split('?')[0];
      }
    }

    return { resourceType, endpoint };
  }

  /**
   * Registra una auditoría exitosa
   */
  private async logAudit(
    request: Request,
    action: AuditAction,
    resourceInfo: { resourceType: string; endpoint: string },
    body: any,
    response: any,
  ): Promise<void> {
    const { user } = request;

    try {
      await this.auditLogsService.create({
        userId: user?.id,
        companyId: user?.person?.company.id,
        action,
        resourceType: resourceInfo.resourceType,
        endpoint: resourceInfo.endpoint,
        newValues: body,
        ipAddress: this.extractIpAddress(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
        status: AuditLogStatus.SUCCESS,
        responseData: this.sanitizeResponse(response),
      });
    } catch (error) {
      this.logger.error('Error logging audit', error);
      // No lanzar el error para no afectar la respuesta al usuario
    }
  }

  /**
   * Registra una auditoría de operación fallida
   */
  private async logFailedAudit(
    request: Request,
    action: AuditAction,
    resourceInfo: { resourceType: string; endpoint: string },
    body: any,
    error: any,
  ): Promise<void> {
    const { user } = request;

    try {
      await this.auditLogsService.create({
        userId: user?.id,
        companyId: user?.person?.company.id,
        action,
        resourceType: resourceInfo.resourceType,
        endpoint: resourceInfo.endpoint,
        newValues: body,
        ipAddress: this.extractIpAddress(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
        status: AuditLogStatus.FAILED,
        errorMessage: error?.message || 'Unknown error',
      });
    } catch (auditError) {
      this.logger.error('Error logging failed audit', auditError);
    }
  }

  /**
   * Extrae la IP real del request considerando proxies
   */
  private extractIpAddress(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      (request.headers['x-ip-address'] as string) ||
      request.socket.remoteAddress ||
      'Unknown'
    );
  }

  /**
   * Sanitiza la respuesta para no guardar datos sensibles
   */
  private sanitizeResponse(response: any): any {
    if (!response) return null;

    // Si es un objeto grande, solo guardar un resumen
    const responseStr = JSON.stringify(response);
    if (responseStr.length > 5000) {
      return {
        message: 'Response too large to log',
        size: responseStr.length,
      };
    }

    // Aquí puedes agregar lógica para eliminar campos sensibles
    return response;
  }
}