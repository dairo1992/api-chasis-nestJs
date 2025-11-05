import { Module } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { CompaniesModule } from '../companies/companies.module';
import { RolesModule } from '../roles/roles.module';
import { SubscriptionPlansModule } from '../subscription_plans/subscription_plans.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person]),
    CompaniesModule,
    RolesModule,
    SubscriptionPlansModule,
    UserModule,
  ],
  controllers: [PersonsController],
  providers: [PersonsService],
  exports: [PersonsService],
})
export class PersonsModule {}
