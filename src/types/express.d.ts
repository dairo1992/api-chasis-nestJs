import { User } from 'src/features/user/entities/user.entity';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
