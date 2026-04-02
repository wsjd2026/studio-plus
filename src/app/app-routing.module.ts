import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'asignaturas', pathMatch: 'full' },
  { path: 'asignaturas', loadChildren: () => import('./pages/asignaturas.module').then(m => m.AsignaturasPageModule) },
  { path: 'recordatorios', loadChildren: () => import('./pages/recordatorios/recordatorios.module').then(m => m.RecordatoriosPageModule) },
  { path: 'mapa', loadChildren: () => import('./pages/mapa/mapa.module').then(m => m.MapaPageModule) },
  { path: 'materiales/:asignaturaId', loadChildren: () => import('./pages/materiales/materiales.module').then(m => m.MaterialesPageModule) },
  { path: 'compartir', loadChildren: () => import('./pages/compartir/compartir.module').then(m => m.CompartirPageModule) },
  { path: 'notas', loadChildren: () => import('./pages/notas/notas.module').then(m => m.NotasPageModule) },
  { path: 'calendario', loadChildren: () => import('./pages/calendario/calendario.module').then(m => m.CalendarioPageModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
