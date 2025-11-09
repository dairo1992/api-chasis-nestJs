class PermissionDto {
  uuid: string;
  name: string;
  code: string;
  resource: string;
  action: string;
}

export class LoginResponseDto {
  user: string;
  access_token: string;
  refresh_token: string;
  role: string;
  company: string;
  permissions: PermissionDto[];
  session_id?: string;
}
