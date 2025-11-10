interface NavigationResource {
  resource: string; // 'users', 'companies', 'reports'
  label: string; // 'Usuarios', 'Empresas'
  icon?: string; // 'users', 'building'
  route: string; // '/users', '/companies'
  permissions: {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  children?: NavigationResource[]; // Para submenús
}

export class LoginResponseDto {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  role: {
    id: string;
    name: string;
  };
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  access_token: string;
  refresh_token: string;
  session_id: string;
  navigation: NavigationResource[];
}
