export interface NavigationResource {
  resource: string;
  label: string;
  icon?: string;
  route: string;
  order?: number; // AGREGADO
  permissions: {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  children?: NavigationResource[];
}
