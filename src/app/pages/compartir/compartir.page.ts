import { Component, OnInit } from '@angular/core';
import { MaterialService } from '../../services/material.service';
import { AsignaturaService } from '../../services/asignatura.service';
import { BluetoothService } from '../../services/bluetooth.service';
import { Material } from '../../models/material.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-compartir',
  templateUrl: './compartir.page.html',
  styleUrls: ['./compartir.page.scss'],
})
export class CompartirPage implements OnInit {
  materiales: Material[] = [];
  asignaturas: any[] = [];

  constructor(
    private materialService: MaterialService,
    private asignaturaService: AsignaturaService,
    private bluetoothService: BluetoothService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.materiales = await this.materialService.getMateriales();
    this.asignaturas = await this.asignaturaService.getAsignaturas();
  }

  obtenerNombreAsignatura(asignaturaId: string): string {
    const asignatura = this.asignaturas.find(a => a.id === asignaturaId);
    return asignatura ? asignatura.nombre : 'Sin asignatura';
  }

  async seleccionarMaterial(material: Material) {
    const alert = await this.alertCtrl.create({
      header: 'Compartir material',
      message: `¿Compartir archivo de ${this.obtenerNombreAsignatura(material.asignaturaId)}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Compartir',
          handler: () => this.compartirMaterial(material)
        }
      ]
    });
    await alert.present();
  }

  async compartirMaterial(material: Material) {
    // Usar el servicio de bluetooth para compartir
    await this.bluetoothService.compartirArchivo(material.url, `apunte_${material.fecha}.jpg`);
  }
}
