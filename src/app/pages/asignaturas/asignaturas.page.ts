import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { Asignatura } from 'src/app/models/asignatura';
import { AlertController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid

@Component({ selector: 'app-asignaturas', templateUrl: './asignaturas.page.html', styleUrls: ['./asignaturas.page.scss'] })
export class AsignaturasPage implements OnInit {
  asignaturas: Asignatura[] = [];

  constructor(
    private asignaturaService: AsignaturaService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
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
            this.asignaturas = await this.asignaturaService.getAsignaturas();
          }
        }
      ]
    });
    await alert.present();
  }

  async editar(asignatura: Asignatura) { /* similar a agregar, pero usando updateAsignatura */ }

  async eliminar(id: string) {
    await this.asignaturaService.deleteAsignatura(id);
    this.asignaturas = await this.asignaturaService.getAsignaturas();
  }
}
