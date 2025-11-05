import { User } from '../entities/user.entity';
import { TokenType } from '../entities/user-token.entity';

export class CreateUserTokenDto {
  user: User;
  tokenType: TokenType;
  token: string;
  expiresAt: Date;
}
