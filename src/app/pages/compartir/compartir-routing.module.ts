import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';  // <--- Asegura esto
import { CompartirPage } from './compartir.page';

const routes: Routes = [
  {
    path: '',
    component: CompartirPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  IonicModule,
  exports: [RouterModule]
})
export class CompartirPageRoutingModule {}
