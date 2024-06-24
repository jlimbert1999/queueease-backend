import { UserRole } from 'src/users/entities/user.entity';

export const MENU_FRONTEND = [
  {
    role: UserRole.ADMIN,
    menu: [
      {
        label: 'Administracion',
        icon: 'pi pi-list',
        items: [
          {
            label: 'Categorias',
            routerLink: 'administration/categories',
          },
          {
            label: 'Servicios',
            routerLink: 'administration/services',
          },
          {
            label: 'Sucursales',
            routerLink: 'administration/branches',
          },
          {
            label: 'Ventanillas',
            routerLink: 'administration/counters',
          },
          {
            label: 'Usuarios',
            routerLink: 'administration/users',
          },
        ],
      },
    ],
  },
  {
    role: UserRole.OFFICER,
    menu: [],
  },
] as const;
