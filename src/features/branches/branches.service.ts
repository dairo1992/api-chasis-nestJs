import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';
import { Branch } from './entities/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) { }

  async create(
    createBranchDto: CreateBranchDto,
  ): Promise<ServiceResponse<Branch>> {
    try {
      const existCompany = await this.companyRepository.findOne({
        where: { uuid: createBranchDto.company_uuid },
      });
      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }

      console.log({
        name: createBranchDto.name?.toLocaleUpperCase(),
        company_uuid: existCompany.uuid,
      });
      const existBranch = await this.branchRepository.findOne({
        where: {
          name: createBranchDto.name?.toLocaleUpperCase(),
          company_uuid: existCompany.uuid,
        },
      });
      // if (existBranch) {
      //   throw new InternalServerErrorException('Branch already exists');
      // }
      const newBranch = this.branchRepository.create({
        ...createBranchDto,
        company_uuid: existCompany.uuid,
      });
      //  await this.branchRepository.save(newBranch);

      return {
        success: true,
        message: 'Branch created successfully',
        data: newBranch,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findAll(): Promise<ServiceResponse<Branch[]>> {
    try {
      const branches = await this.branchRepository.find();
      return {
        success: true,
        message: 'Companies retrieved successfully',
        data: [...branches],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async findOne(uuid: string) {
    try {
      const existBranch = await this.branchRepository.findOne({
        where: { uuid },
      });
      if (!existBranch) {
        throw new InternalServerErrorException('Branch not found');
      }
      return {
        success: true,
        message: 'Company retrieved successfully',
        data: existBranch,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async update(
    uuid: string,
    updateBranchDto: UpdateBranchDto,
  ): Promise<ServiceResponse<Branch>> {
    try {
      const existBranch = await this.branchRepository.findOne({
        where: { uuid },
      });
      if (!existBranch) {
        throw new InternalServerErrorException('Branch not found');
      }

      const existCompany = await this.companyRepository.findOne({
        where: { uuid: updateBranchDto.company_uuid },
      });
      if (!existCompany) {
        throw new InternalServerErrorException('Company not found');
      }

      await this.branchRepository.update(existBranch.id, {
        ...updateBranchDto,
        company_uuid: existCompany.uuid,
      });
      return { success: true, message: 'Company updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async remove(uuid: string): Promise<ServiceResponse<Branch>> {
    try {
      const existBranch = await this.branchRepository.findOne({
        where: { uuid },
      });
      if (!existBranch) {
        throw new InternalServerErrorException('Branch not found');
      }
      await this.branchRepository.softDelete(existBranch.id);
      return { success: true, message: 'Branch deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
