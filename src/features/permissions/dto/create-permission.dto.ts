import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  resource: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsNotEmpty({ message: 'Menu UUID is required' })
  @IsUUID()
  menu_uuid: string;
}
