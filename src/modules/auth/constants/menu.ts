import { UserRole } from 'src/modules/users/entities/user.entity';

export const MENU_FRONTEND = [
  {
    role: UserRole.ADMIN,
    menu: [
      {
        label: 'Administracion',
        icon: 'pi pi-list',
        items: [
          {
            label: 'Preferencias',
            routerLink: 'administration/preferences',
          },
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
      {
        label: 'Reportes',
        icon: 'pi pi-chart-bar',
        items: [
          {
            label: 'Servicio / Usuario',
            routerLink: 'reports/service-user',
          },
        ],
      },
    ],
  },
  {
    role: UserRole.OFFICER,
    menu: [
      { label: 'Atencion', icon: 'pi pi-list', routerLink: 'queue' },
      {
        label: 'Reporte',
        routerLink: 'reports/work',
      },
    ],
  },
] as const;
