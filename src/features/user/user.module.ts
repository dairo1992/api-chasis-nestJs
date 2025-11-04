import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';
import { UserToken } from './entities/user-token.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession, UserToken])],
  providers: [UserService],
  exports: [TypeOrmModule],
})
export class UserModule {}
