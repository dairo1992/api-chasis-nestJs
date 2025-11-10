import { AuditLogStatus } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  sessionId: string;
  action: string;
  resourceType?: string;
  endpoint?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  status: AuditLogStatus;
  responseData?: any;
  errorMessage?: string;
}
