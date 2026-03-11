import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'rooms',
    loadComponent: () => import('./features/rooms/rooms.component').then((m) => m.RoomsComponent),
  },
  {
    path: 'alerts',
    loadComponent: () =>
      import('./shared/components/not-implemented/not-implemented.component').then(
        (m) => m.NotImplementedComponent,
      ),
    data: { label: 'Alerts' },
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./shared/components/not-implemented/not-implemented.component').then(
        (m) => m.NotImplementedComponent,
      ),
    data: { label: 'Reports' },
  },
  {
    path: 'sensors',
    loadComponent: () =>
      import('./shared/components/not-implemented/not-implemented.component').then(
        (m) => m.NotImplementedComponent,
      ),
    data: { label: 'Sensors' },
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./shared/components/not-implemented/not-implemented.component').then(
        (m) => m.NotImplementedComponent,
      ),
    data: { label: 'Settings' },
  },
  { path: '**', redirectTo: '' },
];
