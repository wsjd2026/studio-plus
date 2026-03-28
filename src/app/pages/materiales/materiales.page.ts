import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MaterialService } from '../../services/material.service';
import { AsignaturaService } from '../../services/asignatura.service';
import { Material } from '../../models/material.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-materiales',
  templateUrl: './materiales.page.html',
  styleUrls: ['./materiales.page.scss'],
})
export class MaterialesPage implements OnInit {
  asignaturaId: string;
  nombreAsignatura: string = '';
  materiales: Material[] = [];

  constructor(
    private route: ActivatedRoute,
    private materialService: MaterialService,
    private asignaturaService: AsignaturaService,
    private alertCtrl: AlertController
  ) {
    this.asignaturaId = this.route.snapshot.paramMap.get('asignaturaId') || '';
  }

  async ngOnInit() {
    await this.cargarAsignatura();
    await this.cargarMateriales();
  }

  async cargarAsignatura() {
    const asignaturas = await this.asignaturaService.getAsignaturas();
    const asignatura = asignaturas.find(a => a.id === this.asignaturaId);
    this.nombreAsignatura = asignatura ? asignatura.nombre : 'Asignatura';
  }

  async cargarMateriales() {
    this.materiales = await this.materialService.getMaterialesPorAsignatura(this.asignaturaId);
  }

  async tomarFoto() {
    try {
      await this.materialService.tomarFoto(this.asignaturaId);
      this.cargarMateriales();
    } catch (error) {
      console.error('Error al tomar foto', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo tomar la foto. Asegúrate de tener permisos de cámara.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async eliminar(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar material',
      message: '¿Estás seguro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.materialService.deleteMaterial(id);
            this.cargarMateriales();
          }
        }
      ]
    });
    await alert.present();
  }
}
