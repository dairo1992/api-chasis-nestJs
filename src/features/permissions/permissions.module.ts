import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), MenuModule],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [TypeOrmModule, PermissionsService],
})
export class PermissionsModule {}
