import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription_plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription_plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription_plan.entity';
import { Repository } from 'typeorm';
import { ServiceResponse } from '../common/interfaces/service-response.interface';

@Injectable()
export class SubscriptionPlansService {

  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) { }

  async create(createSubscriptionPlanDto: CreateSubscriptionPlanDto): Promise<ServiceResponse<SubscriptionPlan>> {
    try {
      const existPlan = await this.subscriptionPlanRepository.findOne({ where: { name: createSubscriptionPlanDto.name } });
      if (existPlan) {
        throw new ConflictException('Subscription plan already exists');
      }

      const newPlan = this.subscriptionPlanRepository.create(createSubscriptionPlanDto);
      await this.subscriptionPlanRepository.save(newPlan);
      return { success: true, message: 'Subscription plan created successfully', data: newPlan };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
      // return { success: false, message: 'Error creating subscription plan', error: error.message ?? error.message };
    }
  }

  async findAll(): Promise<ServiceResponse<SubscriptionPlan[]>> {
    try {
      const plans = await this.subscriptionPlanRepository.find();
      return { success: true, message: 'Subscription plans retrieved successfully', data: [...plans] };
    } catch (error) {
      return { success: false, message: 'Error getting subscription plans', error: error.message ?? error };
    }
  }

  async findOne(id: number): Promise<ServiceResponse<SubscriptionPlan>> {
    try {
      const plan = await this.subscriptionPlanRepository.findOne({ where: { id } }) ?? undefined;
      return { success: true, message: 'Subscription plan retrieved successfully', data: plan };
    } catch (error) {
      return { success: false, message: 'Error getting subscription plan', error: error.message ?? error };
    }
  }

  async update(id: number, updateSubscriptionPlanDto: UpdateSubscriptionPlanDto): Promise<ServiceResponse<SubscriptionPlan>> {
    try {
      const plan = await this.subscriptionPlanRepository.findOne({ where: { id } });
      if (!plan) {
        return { success: false, message: 'Subscription plan not found' };
      }
      this.subscriptionPlanRepository.update(id, updateSubscriptionPlanDto);
      return { success: true, message: 'Subscription plan updated successfully' };
    } catch (error) {
      return { success: false, message: 'Error updating subscription plan', error: error.message ?? error };
    }

  }

  async remove(id: number): Promise<ServiceResponse<SubscriptionPlan>> {
    try {
      this.subscriptionPlanRepository.softDelete(id);
      return { success: true, message: 'Subscription plan deleted successfully' };
    } catch (error) {
      return { success: false, message: 'Error deleting subscription plan', error: error.message ?? error };
    }
  }
}
