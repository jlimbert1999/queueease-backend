import { UserRole } from 'src/users/entities/user.entity';

export interface menuFrontend {
  label: string;
  icon?: string;
  routerLink?: string;
  items?: menuFrontend[];
}

export interface menuFrontendConfig {
  role: UserRole;
  menu: menuFrontend;
}
