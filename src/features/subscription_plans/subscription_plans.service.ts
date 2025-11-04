import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription_plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription_plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription_plan.entity';
import { Repository } from 'typeorm';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  async create(
    createSubscriptionPlanDto: CreateSubscriptionPlanDto,
  ): Promise<ServiceResponse<SubscriptionPlan>> {
    try {
      const existPlan = await this.subscriptionPlanRepository.findOne({
        where: { name: createSubscriptionPlanDto.name },
      });
      if (existPlan) {
        throw new InternalServerErrorException(
          'Subscription plan already exists',
        );
      }

      const newPlan = this.subscriptionPlanRepository.create(
        createSubscriptionPlanDto,
      );
      await this.subscriptionPlanRepository.save(newPlan);
      return {
        success: true,
        message: 'Subscription plan created successfully',
        data: newPlan,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findAll(): Promise<ServiceResponse<SubscriptionPlan[]>> {
    try {
      const plans = await this.subscriptionPlanRepository.find();
      return {
        success: true,
        message: 'Subscription plans retrieved successfully',
        data: [...plans],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findOne(uuid: string): Promise<ServiceResponse<SubscriptionPlan>> {
    try {
      const plan =
        (await this.subscriptionPlanRepository.findOne({ where: { uuid } })) ??
        undefined;
      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }
      return {
        success: true,
        message: 'Subscription plan retrieved successfully',
        data: plan,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async update(
    uuid: string,
    updateSubscriptionPlanDto: UpdateSubscriptionPlanDto,
  ): Promise<ServiceResponse<SubscriptionPlan>> {
    try {
      const plan = await this.subscriptionPlanRepository.findOne({
        where: { uuid },
      });
      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }
      await this.subscriptionPlanRepository.update(
        uuid,
        updateSubscriptionPlanDto,
      );
      return {
        success: true,
        message: 'Subscription plan updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async remove(uuid: string): Promise<ServiceResponse<SubscriptionPlan>> {
    try {
      const plan = await this.subscriptionPlanRepository.findOne({
        where: { uuid },
      });
      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }
      await this.subscriptionPlanRepository.softDelete(plan.id);
      return {
        success: true,
        message: 'Subscription plan deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
