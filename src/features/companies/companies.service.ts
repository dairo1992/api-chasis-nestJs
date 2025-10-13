import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';
import { SubscriptionPlan } from '../subscription_plans/entities/subscription_plan.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(SubscriptionPlan) private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,

  ) { }

  async create(createCompanyDto: CreateCompanyDto): Promise<ServiceResponse<Company>> {
    try {
      const existPlan = await this.subscriptionPlanRepository.findOne({ where: { uuid: createCompanyDto.subscription_plan_uuid } });
      if (!existPlan) {
        throw new InternalServerErrorException('Subscription plan not found');
      }

      const existCompany = await this.companyRepository.findOne({ where: { document_number: createCompanyDto.document_number } });
      if (existCompany) {
        throw new InternalServerErrorException('Company already exists');
      }

      const newCompany = this.companyRepository.create(createCompanyDto);
      await this.companyRepository.save(newCompany);
      return { success: true, message: 'Company created successfully', data: newCompany };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findAll(): Promise<ServiceResponse<Company[]>> {
    try {
      const companies = await this.companyRepository.find();
      return { success: true, message: 'Companies retrieved successfully', data: [...companies] };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findOne(uuid: string): Promise<ServiceResponse<Company>> {
    try {
      const existCompany = await this.companyRepository.findOne({ where: { uuid: uuid } });
      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }
      return ({ success: true, message: 'Company retrieved successfully', data: existCompany });
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async update(uuid: string, updateCompanyDto: UpdateCompanyDto): Promise<ServiceResponse<Company>> {
    try {
      const existCompany = await this.companyRepository.findOne({ where: { uuid: uuid } });
      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }

      const existPlan = await this.subscriptionPlanRepository.findOne({ where: { uuid: updateCompanyDto.subscription_plan_uuid } });
      if (!existPlan) {
        throw new InternalServerErrorException('Subscription plan not found');
      }

      this.companyRepository.update(existCompany.id, updateCompanyDto);
      return { success: true, message: 'Company updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async remove(uuid: string): Promise<ServiceResponse<Company>> {
    const existCompany = await this.companyRepository.findOne({ where: { uuid: uuid } });
    if (!existCompany) {
      throw new InternalServerErrorException('Company not found');
    }
    this.companyRepository.softDelete(existCompany.id);
    return { success: true, message: 'Company deleted successfully' };
  }
}
