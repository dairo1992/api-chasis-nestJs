import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRolePermissionDto {
  @IsNotEmpty()
  @IsUUID()
  role_uuid: string;

  @IsNotEmpty()
  @IsUUID()
  permissions_uuid: string;
}
