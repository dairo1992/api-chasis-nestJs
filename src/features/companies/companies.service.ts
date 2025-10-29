import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';
import { SubscriptionPlan } from '../subscription_plans/entities/subscription_plan.entity';
import { CompanyPlanUsage } from './entities/company_plan_usage.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(CompanyPlanUsage)
    private readonly companyPlanUsageRepository: Repository<CompanyPlanUsage>,
  ) { }

  async create(
    createCompanyDto: CreateCompanyDto,
  ): Promise<ServiceResponse<Company>> {
    try {
      const existPlan = await this.subscriptionPlanRepository.findOne({
        where: { uuid: createCompanyDto.subscription_plan_uuid },
      });
      if (!existPlan) {
        throw new InternalServerErrorException('Subscription plan not found');
      }

      const existCompany = await this.companyRepository.findOne({
        where: { document_number: createCompanyDto.document_number },
      });
      if (existCompany) {
        throw new InternalServerErrorException('Company already exists');
      }

      const newCompany = this.companyRepository.create(createCompanyDto);
      await this.companyRepository.save(newCompany);

      const newPlanUsage = this.companyPlanUsageRepository.create({
        company: newCompany,
        plan: existPlan,
        startDate: new Date(),
        max_branches_per_company: existPlan.max_branches_per_company,
        max_users_per_company: existPlan.max_users_per_company,
        max_roles_per_company: existPlan.max_roles_per_company,
      });
      await this.companyPlanUsageRepository.save(newPlanUsage);

      return {
        success: true,
        message: 'Company created successfully',
        data: newCompany,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findAll(): Promise<ServiceResponse<Company[]>> {
    try {
      const companies = await this.companyRepository.find({
        relations: ['branches', 'planUsages', 'planUsages.plan'],
      });
      return {
        success: true,
        message: 'Companies retrieved successfully',
        data: [...companies],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findOne(uuid: string): Promise<ServiceResponse<Company>> {
    try {
      const existCompany = await this.companyRepository.findOne({
        where: { uuid },
        relations: ['branches', 'planUsages', 'planUsages.plan'],
      });
      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }
      return {
        success: true,
        message: 'Company retrieved successfully',
        data: existCompany,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async update(
    uuid: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<ServiceResponse<Company>> {
    try {
      const existCompany = await this.companyRepository.findOne({
        where: { uuid },
      });
      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }

      const existPlan = await this.subscriptionPlanRepository.findOne({
        where: { uuid },
      });
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
    try {
      const existCompany = await this.companyRepository.findOne({
        where: { uuid },
      });
      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }
      await this.companyRepository.softDelete(existCompany.id);
      return { success: true, message: 'Company deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
