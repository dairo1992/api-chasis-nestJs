import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menus } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menus)
    private readonly menuRepository: Repository<Menus>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menus> {
    const menu = this.menuRepository.create(createMenuDto);
    return await this.menuRepository.save(menu);
  }

  async findAll(): Promise<Menus[]> {
    return await this.menuRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findOne(uuid: string): Promise<Menus> {
    const menu = await this.menuRepository.findOne({
      where: { uuid }, // CORREGIDO: Remover 'code'
    });

    if (!menu) {
      throw new NotFoundException(`Menú con uuid ${uuid} no encontrado`);
    }

    return menu;
  }

  async findByCode(code: string): Promise<Menus> {
    const menu = await this.menuRepository.findOne({
      where: { code }, // Ahora buscar por code
    });

    if (!menu) {
      throw new NotFoundException(`Menú con code ${code} no encontrado`);
    }

    return menu;
  }

  async update(uuid: string, updateMenuDto: UpdateMenuDto): Promise<Menus> {
    const menu = await this.findOne(uuid);
    Object.assign(menu, updateMenuDto);
    return await this.menuRepository.save(menu);
  }

  async remove(uuid: string): Promise<void> {
    const menu = await this.findOne(uuid);
    menu.isActive = false;
    await this.menuRepository.save(menu);
  }
}
