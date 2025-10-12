import { Module } from '@nestjs/common';
import { SubscriptionPlansService } from './subscription_plans.service';
import { SubscriptionPlansController } from './subscription_plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription_plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan])],
  controllers: [SubscriptionPlansController],
  providers: [SubscriptionPlansService],
})
export class SubscriptionPlansModule { }
