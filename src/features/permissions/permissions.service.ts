import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { MenuService } from '../menu/menu.service';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly menuService: MenuService,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Buscar el menú
    const menu = await this.menuService.findByCode(
      createPermissionDto.menuCode,
    );

    if (!menu) {
      throw new NotFoundException(
        `Menú con code ${createPermissionDto.menuCode} no encontrado`,
      );
    }

    // Generar código automáticamente: menu.code + '.' + action
    const code = `${menu.code}.${createPermissionDto.action.toLowerCase()}`;

    // Verificar si ya existe un permiso con ese código
    const existingPermission = await this.permissionRepository.findOne({
      where: { code },
    });

    if (existingPermission) {
      throw new BadRequestException(
        `Ya existe un permiso con el código ${code}`,
      );
    }

    // Crear el permiso
    const permission = this.permissionRepository.create({
      name: createPermissionDto.name,
      code: code,
      description: createPermissionDto.description,
      resource: menu.code, // CORREGIDO: Usar menu.code
      action: createPermissionDto.action,
      menu: menu,
    });

    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { isActive: true },
      relations: ['menu'],
    });
  }

  async findOne(uuid: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { uuid },
      relations: ['menu'],
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con uuid ${uuid} no encontrado`);
    }

    return permission;
  }

  async findByCode(code: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { code },
      relations: ['menu'],
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con code ${code} no encontrado`);
    }

    return permission;
  }

  async update(
    uuid: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(uuid);

    if (updatePermissionDto.menuCode) {
      const menu = await this.menuService.findByCode(
        updatePermissionDto.menuCode,
      );
      permission.menu = menu;
      permission.resource = menu.code;
    }

    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async remove(uuid: string): Promise<void> {
    const permission = await this.findOne(uuid);
    permission.isActive = false;
    await this.permissionRepository.save(permission);
  }
}