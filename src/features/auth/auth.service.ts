import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { UserService } from '../user/user.service';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PersonsService } from '../persons/persons.service';
import { CreateUserTokenDto } from '../user/dto/create-user-token.dto';
import { TokenType, UserToken } from '../user/entities/user-token.entity';
import { CreateUserSessionDto } from '../user/dto/create-user-session.dto';
import { Request } from 'express';
import { UserSession } from '../user/entities/user-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JWTPayload } from 'src/common/interfaces/jwt-payload.interface';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';

@Injectable()
export class AuthService {
  private readonly saltRounds = 15;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly personService: PersonsService,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
  ) { }

  async login(
    loginDto: LoginRequestDto,
    request: Request,
  ): Promise<LoginResponseDto> {
    try {
      const user = await this.userService.findOneByUserName(loginDto.username);
      if (!user) {
        throw new InternalServerErrorException('User not found');
      }
      const isMatch = await bcrypt.compare(loginDto.password, user.password);

      if (!isMatch) {
        throw new InternalServerErrorException('Invalid password');
      }

      const person = await this.personService.findByUserName(user.user);
      if (!person) {
        throw new InternalServerErrorException('Person not found');
      }

      const payload: JWTPayload = {
        sub: person.uuid,
        session_id: uuidv4(),
        username: user.user,
      };
      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const createUserTokenDto: CreateUserTokenDto = {
        user: user,
        tokenType: TokenType.REFRESH,
        token: refreshToken,
        expiresAt: expiresAt,
      };

      await this.createUserToken(createUserTokenDto);

      const userSessionDto: CreateUserSessionDto = {
        user: user,
        session_id: payload.session_id,
        sessionToken: accessToken,
        ipAddress: (request.headers['x-ip-address'] as string) ?? request.ip,
        userAgent:
          (request.headers['x-user-agent'] as string) ??
          request.headers['user-agent'],
        expiresAt: expiresAt,
      };
      await this.createUserSession(userSessionDto);

      const response: LoginResponseDto = {
        user: user.user,
        role: person.role.name,
        company: person.company.name,
        access_token: accessToken,
        refresh_token: refreshToken,
        session_id: payload.session_id,
        permissions: person.role.permissions,
      };

      return response;
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async refreshToken(
    refreshDto: RefreshTokenRequestDto,
  ): Promise<LoginResponseDto> {
    try {
      await this.jwtService.verifyAsync(refreshDto.refresh_token).catch(() => {
        throw new InternalServerErrorException('Invalid refresh token');
      });

      const decoded = this.jwtService.decode<JWTPayload>(
        refreshDto.refresh_token,
      );
      if (!decoded) {
        throw new InternalServerErrorException('Invalid refresh token');
      }

      const user = await this.userService.findOneByUserName(decoded.username);
      if (!user) {
        throw new InternalServerErrorException('User not found');
      }

      const person = await this.personService.findByUserName(user.user);
      if (!person) {
        throw new InternalServerErrorException('Person not found');
      }

      const existingToken = await this.validateRefreshToken(
        user.uuid,
        refreshDto.refresh_token,
      );
      if (!existingToken) {
        throw new InternalServerErrorException('Invalid refresh token');
      }

      const existSession = await this.userSessionRepository.findOne({
        where: { session_id: decoded.session_id },
      });
      if (!existSession) {
        throw new InternalServerErrorException('Session not found');
      }

      const payload: JWTPayload = {
        sub: person.uuid,
        session_id: decoded.session_id,
        username: user.user,
      };
      const newAccessToken = await this.jwtService.signAsync(payload);
      const newRefreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const createUserTokenDto: CreateUserTokenDto = {
        user: user,
        tokenType: TokenType.REFRESH,
        token: newRefreshToken,
        expiresAt: expiresAt,
      };

      await this.createUserToken(createUserTokenDto);
      await this.userSessionRepository.update(existSession.id, {
        sessionToken: newAccessToken,
        expiresAt: expiresAt,
      });
      const response: LoginResponseDto = {
        user: user.user,
        role: person.role.name,
        company: person.company.name,
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        permissions: person.role.permissions,
      };

      return response;
      // const response = {
      //   user: '',
      //   role: '',
      //   company: '',
      //   access_token: '',
      //   refresh_token: '',
      // };
      // return response;
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

  async createUserSession(
    createUserSessionDto: CreateUserSessionDto,
  ): Promise<UserSession> {
    try {
      const newUserSession = this.userSessionRepository.create({
        user: createUserSessionDto.user,
        session_id: createUserSessionDto.session_id,
        sessionToken: createUserSessionDto.sessionToken,
        ipAddress: createUserSessionDto.ipAddress,
        userAgent: createUserSessionDto.userAgent,
        expiresAt: createUserSessionDto.expiresAt,
      });
      return await this.userSessionRepository.save(newUserSession);
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }

  async validateRefreshToken(
    user_uuid: string,
    oldToken: string,
  ): Promise<boolean> {
    const exits = await this.userTokenRepository.findOne({
      where: {
        tokenType: TokenType.REFRESH,
        isActive: true,
        user: { uuid: user_uuid },
      },
    });
    if (exits) {
      const isMatch = await bcrypt.compare(oldToken, exits.tokenHash);
      if (isMatch) {
        if (exits.expiresAt! < new Date()) {
          exits.isActive = false;
          await this.userTokenRepository.save(exits);
          return false;
        }
        exits.isActive = false;
        exits.lastUsedAt = new Date();
        await this.userTokenRepository.save(exits);
        return true;
      }
    }
    return false;
  }

  async logout(session_id: string): Promise<void> {
    try {
      const session = await this.userSessionRepository.findOne({
        where: { session_id },
        relations: ['user'],
      });
      if (!session) {
        throw new InternalServerErrorException('Session not found');
      }
      if (!session.isActive) {
        throw new InternalServerErrorException('Session already logged out');
      }

      await this.userTokenRepository.update(
        { user: session.user, isActive: true },
        {
          isActive: false,
          lastUsedAt: new Date(),
        },
      );

      await this.userSessionRepository.update(session.id, {
        isActive: false,
        expiresAt: new Date(),
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message ?? error);
    }
  }
}
