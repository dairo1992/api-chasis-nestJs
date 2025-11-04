import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menus } from './entities/menu.entity';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menus)
    private readonly menuRepository: Repository<Menus>,
  ) { }

  async create(createMenuDto: CreateMenuDto): Promise<ServiceResponse<Menus>> {
    try {
      const existMenu = await this.menuRepository.findOne({
        where: {
          name: createMenuDto.name.toLocaleUpperCase(),
          code: createMenuDto.code,
        },
      });
      if (existMenu) {
        throw new InternalServerErrorException('Menú plan already exists');
      }
      const newMenu = this.menuRepository.create(createMenuDto);
      await this.menuRepository.save(newMenu);
      return {
        success: true,
        message: 'Menú created successfully',
        data: newMenu,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findAll(): Promise<ServiceResponse<Menus[]>> {
    try {
      const menus = await this.menuRepository.find();
      return {
        success: true,
        message: 'Menú retrieved successfully',
        data: [...menus],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findOne(uuid: string): Promise<ServiceResponse<Menus>> {
    try {
      const menu =
        (await this.menuRepository.findOne({ where: { uuid } })) ?? undefined;
      if (!menu) {
        throw new NotFoundException('Menú not found');
      }
      return {
        success: true,
        message: 'Menú retrieved successfully',
        data: menu,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async update(
    uuid: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<ServiceResponse<Menus>> {
    try {
      const menu = await this.menuRepository.findOne({ where: { uuid } });
      if (!menu) {
        throw new NotFoundException('Menú not found');
      }
      await this.menuRepository.update(uuid, updateMenuDto);
      return { success: true, message: 'Menú updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async remove(uuid: string): Promise<ServiceResponse<Menus>> {
    try {
      const menu = await this.menuRepository.findOne({
        where: { uuid },
      });
      if (!menu) {
        throw new NotFoundException('Menú not found');
      }
      await this.menuRepository.softDelete(menu.id);
      return {
        success: true,
        message: 'Menú deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
