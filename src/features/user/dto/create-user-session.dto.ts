import { User } from '../entities/user.entity';

export class CreateUserSessionDto {
  user: User;
  session_id: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
}
