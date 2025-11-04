import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreatePersonDto {
  @IsNotEmpty()
  @IsString()
  document_type: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  document_number: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsUUID()
  company_uuid: string;

  @IsNotEmpty()
  @IsUUID()
  role_uuid: string;

  @IsOptional()
  @IsBoolean()
  create_user: boolean = false;
}
