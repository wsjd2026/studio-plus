import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'asignaturas',
    loadComponent: () => import('./pages/asignaturas/asignaturas.page').then( m => m.AsignaturasPage)
  },
  {
    path: 'recordatorios',
    loadComponent: () => import('./pages/recordatorios/recordatorios.page').then( m => m.RecordatoriosPage)
  },
  {
    path: 'mapa',
    loadComponent: () => import('./pages/mapa/mapa.page').then( m => m.MapaPage)
  },
  {
    path: 'materiales',
    loadComponent: () => import('./pages/materiales/materiales.page').then( m => m.MaterialesPage)
  },
  {
    path: 'compartir',
    loadComponent: () => import('./pages/compartir/compartir.page').then( m => m.CompartirPage)
  },
  {
    path: 'notas',
    loadComponent: () => import('./pages/notas/notas.page').then( m => m.NotasPage)
  },
  {
    path: 'calendario',
    loadComponent: () => import('./pages/calendario/calendario.page').then( m => m.CalendarioPage)
  },
];
