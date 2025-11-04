import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';
import { Person } from './entities/person.entity';
import { Company } from '../companies/entities/company.entity';
import { CompanyPlanUsage } from '../companies/entities/company_plan_usage.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(CompanyPlanUsage)
    private readonly companyPlanUsageRepository: Repository<CompanyPlanUsage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(
    createPersonDto: CreatePersonDto,
  ): Promise<ServiceResponse<Person>> {
    try {
      const company = await this.companyRepository.findOne({
        where: { uuid: createPersonDto.company_uuid },
      });
      if (!company) {
        throw new InternalServerErrorException('Company not found');
      }

      const planUsage = await this.companyPlanUsageRepository.findOne({
        where: { company: { uuid: createPersonDto.company_uuid } },
      });
      if (planUsage!.current_users_count >= planUsage!.max_users_per_company) {
        throw new InternalServerErrorException(
          'User limit exceeded for the company plan',
        );
      }

      const role = await this.roleRepository.findOne({
        where: { uuid: createPersonDto.role_uuid },
      });
      if (!role) {
        throw new InternalServerErrorException('Role not found');
      }

      const exist = await this.personRepository.findOne({
        where: {
          document_number: createPersonDto.document_number,
          company: company,
        },
      });

      if (exist) {
        throw new InternalServerErrorException('Person already exists');
      }

      const newPerson = this.personRepository.create({
        ...createPersonDto,
        company: company,
        role: role,
      });
      await this.personRepository.save(newPerson);

      if (createPersonDto.create_user) {
        const existUser = await this.userRepository.findOne({
          where: { person: newPerson },
        });
        if (existUser) {
          throw new InternalServerErrorException('User already exists');
        }

        const userPartial: Partial<User> = {
          user: createPersonDto.email,
          password: createPersonDto.document_number,
          person: newPerson,
        };
        const newUser = this.userRepository.create(userPartial);
        await this.userRepository.save(newUser);
      }

      planUsage!.current_users_count += 1;
      await this.companyPlanUsageRepository.save(planUsage!);
      return {
        success: true,
        message: 'Person created successfully',
        data: newPerson,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  findAll() {
    return `This action returns all persons`;
  }

  findOne(id: string) {
    return `This action returns a #${id} person`;
  }

  update(id: string, updatePersonDto: UpdatePersonDto) {
    return `This action updates a #${id} person`;
  }

  remove(id: string) {
    return `This action removes a #${id} person`;
  }
}
