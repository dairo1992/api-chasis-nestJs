import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menus } from './entities/menu.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Menus])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [TypeOrmModule, MenuService],
})
export class MenuModule {}
