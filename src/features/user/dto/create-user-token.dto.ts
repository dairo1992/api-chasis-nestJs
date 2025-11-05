import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUserTokenDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsEnum([
    'access',
    'refresh',
    'api_key',
    'password_reset',
    'email_verification',
  ])
  tokenType: string;

  @IsNotEmpty()
  @IsUUID()
  tokenHash: string;

  @IsNotEmpty()
  @IsDate()
  expiresAt: Date | null;
}
