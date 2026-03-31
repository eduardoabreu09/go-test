import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: async () => {
      const m = await import('./dashboard/dashboard');
      return m.DashboardPage;
    },
  },
  {
    path: 'create',
    loadComponent: async () => {
      const m = await import('./create/create');
      return m.CreatePage;
    },
  },
  {
    path: 'simulator',
    loadComponent: async () => {
      const m = await import('./simulator/simulator');
      return m.SimulatorPage;
    },
  },
];
