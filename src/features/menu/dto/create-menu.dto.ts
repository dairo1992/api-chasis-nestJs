export class CreateMenuDto {
  name: string;
  code: string; // AGREGADO
  label: string;
  icon?: string;
  route: string;
  order?: number;
  description?: string;
  parentUuid?: string;
}
