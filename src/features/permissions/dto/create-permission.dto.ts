export class CreatePermissionDto {
  name: string;
  menuCode: string; // CAMBIADO: De menuUuid a menuCode
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  description?: string;
}
