import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Role } from './entities/role.entity';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';
import { CompanyPlanUsage } from '../companies/entities/company_plan_usage.entity';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyPlanUsage)
    private readonly companyPlanUsageRepository: Repository<CompanyPlanUsage>,
    private readonly permissionService: PermissionsService,
  ) {}

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

  async findAllByCompany(
    company_uuid: string,
  ): Promise<ServiceResponse<Role[]>> {
    try {
      const roles = await this.roleRepository.find({
        where: { company_uuid },
      });
      return {
        success: true,
        message: 'Roles found successfully',
        data: roles,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
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

  async createRolePermissions(
    createRolePermissionsDto: CreateRolePermissionDto,
  ): Promise<ServiceResponse<void>> {
    try {
      const role = await this.roleRepository.findOne({
        where: { uuid: createRolePermissionsDto.role_uuid, isActive: true },
        relations: ['permissions'],
      });

      if (!role) {
        throw new InternalServerErrorException('Role not found');
      }

      const permissionResponse = await this.permissionService.findOne(
        createRolePermissionsDto.permissions_uuid,
      );

      if (!permissionResponse) {
        throw new InternalServerErrorException('Permission not found');
      }

      const permissionExists = role.permissions.find(
        (p) => p.uuid === createRolePermissionsDto.permissions_uuid,
      );

      if (permissionExists) {
        throw new InternalServerErrorException(
          'Role permission already exists',
        );
      }

      role.permissions.push(permissionResponse);
      await this.roleRepository.save(role);

      return {
        success: true,
        message: 'Role permissions created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
