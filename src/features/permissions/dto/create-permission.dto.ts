import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(['READ', 'CREATE', 'UPDATE', 'DELETE'], {
    message: 'Action must be one of READ, CREATE, UPDATE, DELETE',
  })
  action: string;

  @IsNotEmpty({ message: 'Menu UUID is required' })
  @IsUUID()
  menu_uuid: string;
}
