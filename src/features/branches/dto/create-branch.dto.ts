import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsOptional()
  @IsPhoneNumber()
  phone: number;

  @IsNotEmpty({ message: 'Adress is required' })
  @IsString()
  address: string;

  @IsNotEmpty({ message: 'City is required' })
  @IsNumber()
  city: number;

  @IsNotEmpty({ message: 'State is required' })
  @IsNumber()
  state: number;

  @IsOptional()
  @IsNumber()
  manager_user_id: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNotEmpty({ message: 'Company UuId is required' })
  @IsUUID()
  company_uuid: string;
}
