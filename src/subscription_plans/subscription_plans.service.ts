import { Injectable } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription_plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription_plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription_plan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionPlansService {

  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) { }

  create(createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    this.subscriptionPlanRepository.create(createSubscriptionPlanDto);
    return {}
  }

  findAll() {
    return `This action returns all subscriptionPlans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscriptionPlan`;
  }

  update(id: number, updateSubscriptionPlanDto: UpdateSubscriptionPlanDto) {
    return `This action updates a #${id} subscriptionPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscriptionPlan`;
  }
}
