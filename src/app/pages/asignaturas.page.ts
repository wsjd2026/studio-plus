import { Component } from '@angular/core';
import { AsignaturaService } from '../services/asignatura.service';
import { Asignatura } from '../models/asignatura.model';
import { AlertController, NavController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-asignaturas',
  templateUrl: './asignaturas.page.html',
  styleUrls: ['./asignaturas.page.scss'],
})
export class AsignaturasPage {
  asignaturas: Asignatura[] = [];

  constructor(
    private asignaturaService: AsignaturaService,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async ionViewWillEnter() {
    this.asignaturas = await this.asignaturaService.getAsignaturas();
  }

  async agregarAsignatura() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva asignatura',
      inputs: [
        { name: 'nombre', placeholder: 'Nombre de la materia', type: 'text' },
        { name: 'docente', placeholder: 'Nombre del docente', type: 'text' },
        { name: 'descripcion', placeholder: 'Descripción', type: 'textarea' },
        { name: 'color', placeholder: 'Color (hex)', type: 'text', value: '#4CAF50' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.nombre.trim()) return false;
            const nueva: Asignatura = {
              id: uuidv4(),
              nombre: data.nombre,
              color: data.color || '#4CAF50',
              docente: data.docente,
              descripcion: data.descripcion
            };
            await this.asignaturaService.addAsignatura(nueva);
            this.asignaturas = await this.asignaturaService.getAsignaturas();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async editar(asignatura: Asignatura) {
    const alert = await this.alertCtrl.create({
      header: 'Editar asignatura',
      inputs: [
        { name: 'nombre', value: asignatura.nombre, placeholder: 'Nombre', type: 'text' },
        { name: 'docente', value: asignatura.docente, placeholder: 'Docente', type: 'text' },
        { name: 'descripcion', value: asignatura.descripcion, placeholder: 'Descripción', type: 'textarea' },
        { name: 'color', value: asignatura.color, placeholder: 'Color (hex)', type: 'text' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Actualizar',
          handler: async (data) => {
            const editada: Asignatura = { ...asignatura, ...data };
            await this.asignaturaService.updateAsignatura(asignatura.id, editada);
            this.asignaturas = await this.asignaturaService.getAsignaturas();
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminar(id: string) {
    const confirm = await this.alertCtrl.create({
      header: 'Eliminar',
      message: '¿Seguro que quieres eliminar esta asignatura?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.asignaturaService.deleteAsignatura(id);
            this.asignaturas = await this.asignaturaService.getAsignaturas();
          }
        }
      ]
    });
    await confirm.present();
  }

  verMateriales(asignaturaId: string) {
    this.navCtrl.navigateForward(`/materiales/${asignaturaId}`);
  }
}
