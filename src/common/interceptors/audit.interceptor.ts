import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../features/audit-logs/audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, params } = request;

    const resourceType = url.split('/')[3]?.split('?')[0];
    const resourceId = params.id;

    let action = 'READ';
    if (method === 'POST') action = 'CREATE';
    if (method === 'PUT' || method === 'PATCH') action = 'UPDATE';
    if (method === 'DELETE') action = 'DELETE';

    // We will only log mutations for now
    if (action === 'READ') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        this.auditLogsService.create({
          userId: user?.id,
          companyId: user?.companyId,
          action,
          resourceType,
          resourceId,
          newValues: body,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
      }),
    );
  }
}
