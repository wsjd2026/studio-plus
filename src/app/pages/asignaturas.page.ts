import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../services/asignatura.service';
import { Asignatura } from '../../models/asignatura.model';
import { AlertController, NavController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-asignaturas',
  templateUrl: './asignaturas.page.html',
  styleUrls: ['./asignaturas.page.scss'],
})
export class AsignaturasPage implements OnInit {
  asignaturas: Asignatura[] = [];

  constructor(
    private asignaturaService: AsignaturaService,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.cargarAsignaturas();
  }

  async cargarAsignaturas() {
    this.asignaturas = await this.asignaturaService.getAsignaturas();
  }

  async agregarAsignatura() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva asignatura',
      inputs: [
        { name: 'nombre', placeholder: 'Nombre', type: 'text' },
        { name: 'color', placeholder: 'Color (hex)', type: 'text', value: '#FFC107' },
        { name: 'docente', placeholder: 'Docente', type: 'text' },
        { name: 'descripcion', placeholder: 'Descripción', type: 'textarea' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            const nueva: Asignatura = {
              id: uuidv4(),
              nombre: data.nombre,
              color: data.color,
              docente: data.docente,
              descripcion: data.descripcion
            };
            await this.asignaturaService.addAsignatura(nueva);
            this.cargarAsignaturas();
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
        { name: 'color', value: asignatura.color, placeholder: 'Color (hex)', type: 'text' },
        { name: 'docente', value: asignatura.docente, placeholder: 'Docente', type: 'text' },
        { name: 'descripcion', value: asignatura.descripcion, placeholder: 'Descripción', type: 'textarea' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Actualizar',
          handler: async (data) => {
            const editada: Asignatura = {
              ...asignatura,
              nombre: data.nombre,
              color: data.color,
              docente: data.docente,
              descripcion: data.descripcion
            };
            await this.asignaturaService.updateAsignatura(asignatura.id, editada);
            this.cargarAsignaturas();
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminar(id: string) {
    await this.asignaturaService.deleteAsignatura(id);
    this.cargarAsignaturas();
  }

  verMateriales(asignaturaId: string) {
    this.navCtrl.navigateForward(`/materiales/${asignaturaId}`);
  }
}
