import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { UserService } from '../user/user.service';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) { }

  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const user = await this.userService.findOneByUserName(loginDto.username);
      if (!user) {
        throw new InternalServerErrorException('User not found');
      }
      const isMatch = await bcrypt.compare(loginDto.password, user.password);
      console.log(`validacion: ${isMatch}`);
      
      if (!isMatch) {
        throw new InternalServerErrorException('Invalid password');
      }
      return {
        user
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
