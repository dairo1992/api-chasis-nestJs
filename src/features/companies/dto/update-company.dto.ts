import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, IsUrl, IsUUID, MaxLength, Min, MinLength } from "class-validator";

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {

    @IsNotEmpty({ message: 'Name is required' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'legal Name is required' })
    @IsString()
    legal_name: string;

    @IsNotEmpty({ message: 'Adress is required' })
    @IsString()
    address: string;

    @IsNotEmpty({ message: 'City is required' })
    @IsNumber()
    city: string;

    @IsNotEmpty({ message: 'State is required' })
    @IsNumber()
    state: string;

    @IsNotEmpty({ message: 'Country is required' })
    @IsNumber()
    country: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: 'Phone is required' })
    @IsPhoneNumber('CO', { message: 'Phone must be a valid Colombian phone number' })
    phone: string;

    @IsOptional()
    // @IsUrl({  require_tld: false }, { message: 'Website must be a valid URL' })
    @IsString()
    Website: string;

    //usuario dueño de la compañia
    @IsOptional()
    @IsNumber()
    ownerUserId: number;

    @IsOptional()
    // @IsUrl({}, { message: 'Logo URL must be a valid URL' })
    @IsString()
    logo_url: string;

    @IsNotEmpty({ message: 'Subscription Plan UUID is required' })
    @IsUUID()
    subscription_plan_uuid: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
