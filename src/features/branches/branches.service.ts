import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';
import { Branch } from './entities/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { CompanyPlanUsage } from '../companies/entities/company_plan_usage.entity';
import { SubscriptionPlansService } from '../subscription_plans/subscription_plans.service';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyPlanUsage)
    private readonly companyPlanUsageRepository: Repository<CompanyPlanUsage>,
    private readonly planService: SubscriptionPlansService,
  ) { }

  async create(
    createBranchDto: CreateBranchDto,
  ): Promise<ServiceResponse<Branch>> {
    try {
      const existCompany = await this.companyRepository.findOne({
        where: { uuid: createBranchDto.company_uuid },
        relations: ['branches', 'planUsages', 'planUsages.plan'],
      });

      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }

      const existBranch = await this.branchRepository.findOne({
        where: {
          name: createBranchDto.name.toLocaleUpperCase(),
        },
      });

      if (existBranch) {
        if (existBranch.company_uuid === existCompany.uuid) {
          throw new InternalServerErrorException('Branch already exists');
        }
      }

      const activePlan = existCompany.planUsages;

      if (!activePlan) {
        throw new InternalServerErrorException(
          'No active plan found for the company',
        );
      }

      const plan = await this.planService
        .findOne(activePlan.plan.uuid)
        .then((plan) => plan.data);

      if (existCompany.branches.length >= plan!.max_branches_per_company) {
        throw new InternalServerErrorException(
          'Branch limit reached for the current plan',
        );
      }

      const newBranch = this.branchRepository.create({
        ...createBranchDto,
        name: createBranchDto.name.toLocaleUpperCase(),
        company: existCompany,
      });
      await this.branchRepository.save(newBranch);
      await this.companyPlanUsageRepository.update(activePlan.id, {
        current_branches_count: activePlan.current_branches_count + 1,
      });
      newBranch.company.planUsages.current_branches_count =
        activePlan.current_branches_count + 1;
      return {
        success: false,
        message: 'Branch created successfully',
        data: newBranch,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findAll(): Promise<ServiceResponse<Branch[]>> {
    try {
      const branches = await this.branchRepository.find();
      return {
        success: true,
        message: 'Companies retrieved successfully',
        data: [...branches],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findOne(uuid: string) {
    try {
      const existBranch = await this.branchRepository.findOne({
        where: { uuid },
      });
      if (!existBranch) {
        throw new InternalServerErrorException('Branch not found');
      }
      return {
        success: true,
        message: 'Company retrieved successfully',
        data: existBranch,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async update(
    uuid: string,
    updateBranchDto: UpdateBranchDto,
  ): Promise<ServiceResponse<Branch>> {
    try {
      const existBranch = await this.branchRepository.findOne({
        where: { uuid },
      });
      if (!existBranch) {
        throw new InternalServerErrorException('Branch not found');
      }

      const existCompany = await this.companyRepository.findOne({
        where: { uuid: updateBranchDto.company_uuid },
      });
      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { company_uuid, ...branchData } = updateBranchDto;
      await this.branchRepository.update(existBranch.id, {
        ...branchData,
        company: existCompany,
      });
      return { success: true, message: 'Company updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async remove(uuid: string): Promise<ServiceResponse<Branch>> {
    try {
      const existBranch = await this.branchRepository.findOne({
        where: { uuid },
      });
      if (!existBranch) {
        throw new InternalServerErrorException('Branch not found');
      }
      await this.branchRepository.softDelete(existBranch.id);
      return { success: true, message: 'Branch deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
