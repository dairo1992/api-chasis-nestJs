import { Expose, Type } from 'class-transformer';

class CompanyBasicDto {
  @Expose()
  uuid: string;

  @Expose()
  name: string;
}

class RoleBasicDto {
  @Expose()
  uuid: string;

  @Expose()
  name: string;
}

export class PersonResponseDto {
  @Expose()
  id: string;

  @Expose()
  uuid: string;

  @Expose()
  document_type: string;

  @Expose()
  document_number: string;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  country: string;

  @Expose()
  state: string;

  @Expose()
  city: string;

  @Expose()
  @Type(() => CompanyBasicDto)
  company: CompanyBasicDto;

  @Expose()
  @Type(() => RoleBasicDto)
  role: RoleBasicDto;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
