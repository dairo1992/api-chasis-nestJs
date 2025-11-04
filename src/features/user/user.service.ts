import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existUser = await this.userRepository.findOne({
        where: { user: createUserDto.user },
      });
      if (existUser) {
        throw new InternalServerErrorException('User already exists');
      }
      const newUser = this.userRepository.create({
        ...createUserDto,
        person: createUserDto.person_uuid,
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(uuid: string): Promise<User | null> {
    try {
      return this.userRepository.findOne({
        where: { uuid },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}