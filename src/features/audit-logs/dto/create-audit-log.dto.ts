import { AuditLogStatus } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  userId?: number;
  companyId?: number;
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
