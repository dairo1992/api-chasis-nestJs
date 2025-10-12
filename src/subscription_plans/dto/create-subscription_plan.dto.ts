import { isEnum, IsNotEmpty, IsNumber, IsString, Min, IsBoolean, IsOptional, IsEnum } from "class-validator";

export class CreateSubscriptionPlanDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Description is required' })
    @IsString()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    price: number;

    @IsNotEmpty({ message: 'Billing cycle is required' })
    @IsString()
    @IsEnum(['monthly', 'annually', 'ilimited'], { message: 'Invalid billing cycle' })
    billing_cycle: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    max_branches_per_company?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    max_users_per_company?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    max_roles_per_company?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    max_storage_gb?: number;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
