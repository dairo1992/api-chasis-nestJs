export class CreateAuditLogDto {
  userId?: number;
  companyId?: number;
  action: string;
  resourceType?: string;
  resourceId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}
