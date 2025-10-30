import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { RolePermissions } from './entities/role-permissions.entity';
import { Role } from './entities/role.entity';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(RolePermissions)
    private readonly companyPlanUsageRepository: Repository<RolePermissions>,
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
      console.log(existCompany);

      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }
      return {
        success: true,
        message: 'Role created successfully',
        data: existRole!,
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
