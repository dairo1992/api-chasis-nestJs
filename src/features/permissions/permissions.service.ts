import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menus } from '../menu/entities/menu.entity';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Menus)
    private readonly menuRepository: Repository<Menus>,
  ) { }

  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<ServiceResponse<Permission>> {
    try {
      const menu = await this.menuRepository.findOne({
        where: { uuid: createPermissionDto.menu_uuid },
      });
      if (!menu) {
        throw new NotFoundException('Menu not found');
      }
      const code = `${menu.code}.${createPermissionDto.action.toLocaleLowerCase()}`;
      const existPermission = await this.permissionRepository.findOne({
        where: {
          name: createPermissionDto.name.toLocaleUpperCase(),
          code: code,
        },
      });
      if (existPermission) {
        throw new InternalServerErrorException('Permission already exists');
      }
      const newPermission = this.permissionRepository.create({
        ...createPermissionDto,
        code: code,
        resource: menu.code,
      });
      await this.permissionRepository.save(newPermission);
      return {
        success: true,
        message: 'Permission created successfully',
        data: newPermission,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findAll(): Promise<ServiceResponse<Permission[]>> {
    try {
      const permissions = await this.permissionRepository.find();
      return {
        success: true,
        message: 'Permissions retrieved successfully',
        data: [...permissions],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findOne(id: string): Promise<ServiceResponse<Permission>> {
    try {
      const permission =
        (await this.permissionRepository.findOne({ where: { uuid: id } })) ??
        undefined;
      if (!permission) {
        throw new NotFoundException('Permission not found');
      }
      return {
        success: true,
        message: 'Permission retrieved successfully',
        data: permission,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<ServiceResponse<Permission>> {
    const exit = await this.findOne(id);
    if (!exit) {
      throw new NotFoundException('Permission not found');
    }
    await this.permissionRepository.update(id, updatePermissionDto);
    return {
      success: true,
      message: 'This action updates a #' + id + ' permission',
      data: exit.data,
    };
  }

  async remove(id: string): Promise<ServiceResponse<Permission>> {
    const exit = await this.findOne(id);
    if (!exit) {
      throw new NotFoundException('Permission not found');
    }
    await this.permissionRepository.softDelete(id);
    return {
      success: true,
      message: 'Permission deleted successfully',
    };
  }
}
