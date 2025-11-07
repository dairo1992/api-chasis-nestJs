import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
