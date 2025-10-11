import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) { }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      // Es importante cargar las entidades desde sus módulos
      //entities: [join(__dirname, '/../../**/*.entity{.ts,.js}')],
      autoLoadEntities: true,
      // Sincronizar solo en desarrollo. En producción usar migraciones.
      synchronize: true, // ¡NUNCA true en producción!
      logging: false,
    };
  }
}
