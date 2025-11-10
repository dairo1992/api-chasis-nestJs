import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
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
import { Permission } from '../permissions/entities/permission.entity';
import { NavigationResource } from 'src/common/interfaces/navigation-resource.interface';
import { Menus } from '../menu/entities/menu.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
      // Validar usuario
      const user = await this.userService.findOneByUserName(loginDto.username);
      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Validar contraseña
      const isMatch = await bcrypt.compare(loginDto.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Obtener información de la persona
      const person = await this.personService.findByUserName(user.user);
      if (!person) {
        throw new InternalServerErrorException(
          'Información de usuario no encontrada',
        );
      }

      // Construir navegación basada en permisos
      const navigation = this.buildNavigation(person.role.permissions);

      // Generar tokens
      const sessionId = uuidv4();
      const payload: JWTPayload = {
        sub: person.uuid,
        session_id: sessionId,
        username: user.user,
      };

      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      // Guardar refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.createUserToken({
        user: user,
        tokenType: TokenType.REFRESH,
        token: refreshToken,
        expiresAt: expiresAt,
      });

      // Crear sesión
      await this.createUserSession({
        user: user,
        session_id: sessionId,
        sessionToken: accessToken,
        ipAddress: this.extractIpAddress(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
        expiresAt: expiresAt,
      });

      // Construir respuesta
      const response: LoginResponseDto = {
        user: {
          id: person.uuid,
          email: user.user,
          firstName: user.person.first_name,
          lastName: user.person.last_name,
          avatar: user.person.avatar,
        },
        role: {
          id: person.role.uuid,
          name: person.role.name,
        },
        company: {
          id: person.company.uuid,
          name: person.company.name,
          logo: person.company.logo_url,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        session_id: sessionId,
        navigation: navigation,
      };

      this.logger.log(`Usuario ${user.user} inició sesión exitosamente`);
      return response;
    } catch (error) {
      this.logger.error(`Error en login: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al iniciar sesión');
    }
  }

  /**
   * Construye la navegación basada en los permisos del usuario
   */
  private buildNavigation(permissions: Permission[]): NavigationResource[] {
    if (!permissions || permissions.length === 0) {
      return [];
    }

    // Agrupar permisos por menú
    const menuMap = new Map<
      string,
      {
        menu: Menus;
        permissions: Permission[];
      }
    >();

    permissions.forEach((permission) => {
      // Verificar que el menú existe y está cargado
      if (!permission.menu || !permission.menu.uuid) {
        this.logger.warn(`Permiso sin menú asociado: ${permission.code}`);
        return;
      }

      const menu = permission.menu;
      const menuKey = menu.uuid;

      if (!menuMap.has(menuKey)) {
        menuMap.set(menuKey, {
          menu: menu,
          permissions: [],
        });
      }

      menuMap.get(menuKey)?.permissions.push(permission);
    });

    // Construir navegación
    const navigation: NavigationResource[] = [];

    menuMap.forEach(({ menu, permissions }) => {
      // Calcular permisos agregados
      const aggregatedPermissions = {
        canCreate: permissions.some((p) => p.action === 'CREATE'),
        canRead: permissions.some((p) => p.action === 'READ'),
        canUpdate: permissions.some((p) => p.action === 'UPDATE'),
        canDelete: permissions.some((p) => p.action === 'DELETE'),
      };

      // Solo agregar si tiene al menos permiso de lectura
      if (aggregatedPermissions.canRead) {
        navigation.push({
          resource: menu.code, // Usar menu.code en lugar de permissions[0].resource
          label: menu.label,
          icon: menu.icon,
          route: menu.route,
          order: menu.order, // Ahora order existe en la interfaz
          permissions: aggregatedPermissions,
        });
      }
    });

    // Ordenar por orden definido en el menú
    return navigation.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * Extrae la IP real considerando proxies
   */
  private extractIpAddress(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      (request.headers['x-ip-address'] as string) ||
      request.socket.remoteAddress ||
      'Unknown'
    );
  }

  async refreshToken(
    refreshDto: RefreshTokenRequestDto,
  ): Promise<LoginResponseDto> {
    try {
      // Verificar token
      await this.jwtService.verifyAsync(refreshDto.refresh_token).catch(() => {
        throw new UnauthorizedException('Refresh token inválido');
      });

      const decoded = this.jwtService.decode<JWTPayload>(
        refreshDto.refresh_token,
      );
      if (!decoded) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Validar usuario
      const user = await this.userService.findOneByUserName(decoded.username);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const person = await this.personService.findByUserName(user.user);
      if (!person) {
        throw new InternalServerErrorException(
          'Información de usuario no encontrada',
        );
      }

      // Validar refresh token en BD
      const isValidToken = await this.validateRefreshToken(
        user.uuid,
        refreshDto.refresh_token,
      );
      if (!isValidToken) {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }

      // Validar sesión
      const existSession = await this.userSessionRepository.findOne({
        where: { session_id: decoded.session_id },
      });
      if (!existSession) {
        throw new UnauthorizedException('Sesión no encontrada');
      }

      // Generar nuevos tokens
      const payload: JWTPayload = {
        sub: person.uuid,
        session_id: decoded.session_id,
        username: user.user,
      };

      const newAccessToken = await this.jwtService.signAsync(payload);
      const newRefreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      // Actualizar tokens
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.createUserToken({
        user: user,
        tokenType: TokenType.REFRESH,
        token: newRefreshToken,
        expiresAt: expiresAt,
      });

      await this.userSessionRepository.update(existSession.id, {
        sessionToken: newAccessToken,
        expiresAt: expiresAt,
      });

      // Construir navegación
      const navigation = this.buildNavigation(person.role.permissions);

      // Construir respuesta
      const response: LoginResponseDto = {
        user: {
          id: person.uuid,
          email: user.user,
          firstName: user.person.first_name,
          lastName: user.person.last_name,
          avatar: user.person.avatar,
        },
        role: {
          id: person.role.uuid,
          name: person.role.name,
        },
        company: {
          id: person.company.uuid,
          name: person.company.name,
          logo: person.company.logo_url,
        },
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        session_id: decoded.session_id,
        navigation: navigation,
      };

      this.logger.log(`Token renovado para usuario ${user.user}`);
      return response;
    } catch (error) {
      this.logger.error(`Error en refreshToken: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al renovar token');
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
      this.logger.error(`Error creando token: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear token');
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
      this.logger.error(`Error creando sesión: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear sesión');
    }
  }

  async validateRefreshToken(
    user_uuid: string,
    oldToken: string,
  ): Promise<boolean> {
    try {
      const existingToken = await this.userTokenRepository.findOne({
        where: {
          tokenType: TokenType.REFRESH,
          isActive: true,
          user: { uuid: user_uuid },
        },
      });

      if (!existingToken) {
        return false;
      }

      const isMatch = await bcrypt.compare(oldToken, existingToken.tokenHash);
      if (!isMatch) {
        return false;
      }

      // Verificar expiración
      if (existingToken.expiresAt && existingToken.expiresAt < new Date()) {
        existingToken.isActive = false;
        await this.userTokenRepository.save(existingToken);
        return false;
      }

      // Marcar como usado
      existingToken.isActive = false;
      existingToken.lastUsedAt = new Date();
      await this.userTokenRepository.save(existingToken);

      return true;
    } catch (error) {
      this.logger.error(
        `Error validando refresh token: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async logout(session_id: string): Promise<void> {
    try {
      const session = await this.userSessionRepository.findOne({
        where: { session_id },
        relations: ['user'],
      });

      if (!session) {
        throw new UnauthorizedException('Sesión no encontrada');
      }

      if (!session.isActive) {
        throw new UnauthorizedException('Sesión ya cerrada');
      }

      // Invalidar todos los tokens del usuario
      await this.userTokenRepository.update(
        { user: session.user, isActive: true },
        {
          isActive: false,
          lastUsedAt: new Date(),
        },
      );

      // Cerrar sesión
      await this.userSessionRepository.update(session.id, {
        isActive: false,
        expiresAt: new Date(),
      });

      this.logger.log(`Sesión ${session_id} cerrada exitosamente`);
    } catch (error) {
      this.logger.error(`Error en logout: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al cerrar sesión');
    }
  }
}
