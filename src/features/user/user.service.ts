import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly saltRounds = 15;
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
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      const { person_uuid, ...rest } = createUserDto;
      const newUser = this.userRepository.create({
        ...rest,
        password: hashedPassword,
        person: { uuid: person_uuid },
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

  async findOneByUserName(userName: string): Promise<{ user: string; password: string } | null> {
    try {
      const user: { user: string; password: string } | undefined =
        await this.userRepository
          .createQueryBuilder('user')
          .select(['user.user AS user', 'user.password AS password'])
          .where('user.user = :user', { user: userName })
          .andWhere('user.is_active = :isActive', { isActive: true })
          .getRawOne();
      return user ?? null;
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
