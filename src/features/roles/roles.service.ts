import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Role } from './entities/role.entity';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';
import { CompanyPlanUsage } from '../companies/entities/company_plan_usage.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyPlanUsage)
    private readonly companyPlanUsageRepository: Repository<CompanyPlanUsage>,
  ) { }

  async create(createRoleDto: CreateRoleDto): Promise<ServiceResponse<Role>> {
    try {
      const existRole = await this.roleRepository.findOne({
        where: { name: createRoleDto.name.toLocaleUpperCase() },
      });

      if (existRole) {
        if (
          existRole.company_uuid != null &&
          existRole.company_uuid === createRoleDto.company_uuid
        ) {
          throw new InternalServerErrorException('Role already exists');
        }
        throw new InternalServerErrorException('Role already exists');
      }

      const existCompany = await this.companyRepository.findOne({
        where: { uuid: createRoleDto.company_uuid },
      });

      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }

      const newRole = this.roleRepository.create({
        ...createRoleDto,
        name: createRoleDto.name.toLocaleUpperCase(),
      });
      await this.roleRepository.save(newRole);
      const plan = await this.companyPlanUsageRepository.findOne({
        where: { company: { uuid: createRoleDto.company_uuid } },
      });
      if (plan) {
        plan.current_roles_count += 1;
        await this.companyPlanUsageRepository.save(plan);
      }
      return {
        success: true,
        message: 'Role created successfully',
        data: newRole,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
