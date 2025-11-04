import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';
import { Person } from './entities/person.entity';
import { Company } from '../companies/entities/company.entity';
import { CompanyPlanUsage } from '../companies/entities/company_plan_usage.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { PersonResponseDto } from './dto/response-person.dto';
import { plainToInstance } from 'class-transformer';

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
    private readonly userService: UserService,
  ) { }

  async create(
    createPersonDto: CreatePersonDto,
  ): Promise<ServiceResponse<PersonResponseDto>> {
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
          document_type: createPersonDto.document_type,
          document_number: createPersonDto.document_number,
          company: { uuid: createPersonDto.company_uuid },
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
        const existUser = await this.userService.findOne(newPerson.uuid);
        if (existUser) {
          throw new InternalServerErrorException('User already exists');
        }
        const userPartial: CreateUserDto = {
          user: createPersonDto.email,
          password: createPersonDto.document_number,
          person_uuid: newPerson.uuid,
        };
        await this.userService.create(userPartial);
      }

      planUsage!.current_users_count += 1;
      await this.companyPlanUsageRepository.save(planUsage!);

      const personResponse = plainToInstance(PersonResponseDto, newPerson, {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        message: 'Person created successfully',
        data: personResponse,
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
