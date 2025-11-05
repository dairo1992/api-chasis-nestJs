import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { UserService } from '../user/user.service';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PersonsService } from '../persons/persons.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly personService: PersonsService,
  ) { }

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

      const person = await this.personService.findByUserName(user.user);
      if (!person) {
        throw new InternalServerErrorException('Person not found');
      }
      const payload = {
        sub: person.uuid,
        username: user.user,
      };
      const response = {
        user: user.user,
        role: person.role.name,
        company: person.company.name,
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
        }),
      };

      return response;
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
