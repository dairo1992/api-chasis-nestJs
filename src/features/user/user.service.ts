import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserToken } from './entities/user-token.entity';
import { CreateUserTokenDto } from './dto/create-user-token.dto';

@Injectable()
export class UserService {
  private readonly saltRounds = 15;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
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
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        person: { uuid: createUserDto.person_uuid },
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
        relations: ['person', 'person.company', 'person.role'],
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

  async findOneByUserName(userName: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { user: userName, isActive: true },
        relations: ['person', 'person.company', 'person.role'],
      });
      return user ?? null;
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async createUserToken(
    createUserTokenDto: CreateUserTokenDto,
  ): Promise<UserToken> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const tokenHash = await bcrypt.hash(createUserTokenDto.token, salt);
      const newUserToken = this.userTokenRepository.create({
        user: createUserTokenDto.user,
        tokenType: createUserTokenDto.tokenType,
        tokenHash: tokenHash,
        expiresAt: createUserTokenDto.expiresAt,
      });
      return await this.userTokenRepository.save(newUserToken);
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
