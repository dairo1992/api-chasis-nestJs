import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolePermissions } from './entities/role-permissions.entity';
import { CompaniesModule } from '../companies/companies.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RolePermissions]),
    CompaniesModule,
    PermissionsModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [TypeOrmModule],
})
export class RolesModule { }
