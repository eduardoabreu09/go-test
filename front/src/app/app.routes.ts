import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: async () => {
      const m = await import('./home/home');
      return m.Home;
    },
  },
  {
    path: 'firmware',
    loadComponent: async () => {
      const m = await import('./firmware/firmware');
      return m.Firmware;
    },
  },
];
