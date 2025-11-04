import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
import { SubscriptionPlansModule } from './features/subscription_plans/subscription_plans.module';
import { BranchesModule } from './features/branches/branches.module';
import { CompaniesModule } from './features/companies/companies.module';
import { MenuModule } from './features/menu/menu.module';
import { PermissionsModule } from './features/permissions/permissions.module';
import { RolesModule } from './features/roles/roles.module';
import { UserModule } from './features/user/user.module';
import { AuditLogsModule } from './features/audit-logs/audit-logs.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { PersonsModule } from './features/persons/persons.module';

@Module({
  imports: [
    // 1. Configuración global de los .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 2. Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    CompaniesModule,
    SubscriptionPlansModule,
    BranchesModule,
    MenuModule,
    PermissionsModule,
    RolesModule,
    UserModule,
    AuditLogsModule,
    PersonsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
