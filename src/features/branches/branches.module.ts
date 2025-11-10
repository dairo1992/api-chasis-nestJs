import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { CompaniesModule } from '../companies/companies.module';
import { SubscriptionPlansModule } from '../subscription_plans/subscription_plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch]),
    CompaniesModule,
    SubscriptionPlansModule,
  ],
  controllers: [BranchesController],
  providers: [BranchesService],
})
export class BranchesModule {}
