import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { SubscriptionPlansModule } from '../subscription_plans/subscription_plans.module';
import { CompanyPlanUsage } from './entities/company_plan_usage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyPlanUsage]),
    SubscriptionPlansModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
