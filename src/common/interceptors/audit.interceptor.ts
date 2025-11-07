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
  constructor(private readonly auditLogsService: AuditLogsService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, params } = request;

    const resourceType = url.split('/')[3]?.split('?')[0];
    const endpoint = url.split('/')[4] ?? '';

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
        void this.auditLogsService.create({
          userId: user?.id,
          companyId: user?.companyId,
          action,
          resourceType,
          endpoint: endpoint,
          newValues: body,
          ipAddress: request.headers['x-ip-address'],
          userAgent: request.headers['user-agent'],
        });
      }),
    );
  }
}
