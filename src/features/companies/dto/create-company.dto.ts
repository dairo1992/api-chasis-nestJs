import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, IsUrl } from "class-validator";

export class CreateCompanyDto {

    @IsNotEmpty({ message: 'Name is required' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'legal Name is required' })
    @IsString()
    legal_name: string;

    @IsNotEmpty({ message: 'Document Number is required' })
    @IsNumber()
    document_number: number;

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
    @IsPhoneNumber()
    phone: string;

    @IsOptional()
    @IsUrl({}, { message: 'Website must be a valid URL' })
    Website: string;

    //usuario dueño de la compañia
    @IsOptional()
    @IsNumber()
    ownerUserId: number;

    @IsOptional()
    @IsUrl({}, { message: 'Logo URL must be a valid URL' })
    logo_url: string;

    @IsNotEmpty({ message: 'Subscription Plan UUID is required' })
    @IsNumber()
    subscription_plan_uuid: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
