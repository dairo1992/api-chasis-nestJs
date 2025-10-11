import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';

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
    CompaniesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
