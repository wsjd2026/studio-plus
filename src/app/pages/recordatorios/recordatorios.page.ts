import { Component } from '@angular/core';
import { RecordatorioService } from '../../services/recordatorio.service';
import { AsignaturaService } from '../../services/asignatura.service';
import { Recordatorio } from '../../models/recordatorio.model';
import { Asignatura } from '../../models/asignatura.model';
import { AlertController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-recordatorios',
  templateUrl: './recordatorios.page.html',
  styleUrls: ['./recordatorios.page.scss'],
})
export class RecordatoriosPage {
  recordatorios: Recordatorio[] = [];
  asignaturas: Asignatura[] = [];

  constructor(
    private recordatorioService: RecordatorioService,
    private asignaturaService: AsignaturaService,
    private alertCtrl: AlertController
  ) {}

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.asignaturas = await this.asignaturaService.getAsignaturas();
    this.recordatorios = await this.recordatorioService.getRecordatorios();
  }

  obtenerNombreAsignatura(asignaturaId: string): string {
    const asignatura = this.asignaturas.find(a => a.id === asignaturaId);
    return asignatura ? asignatura.nombre : 'General';
  }

  async agregarRecordatorio() {
    const asigInputs = this.asignaturas.map((a, i) => ({
      name: 'asignaturaId',
      type: 'radio' as const,
      label: a.nombre,
      value: a.id,
      checked: i === 0
    }));

    const selectAsig = await this.alertCtrl.create({
      header: 'Selecciona la asignatura',
      inputs: asigInputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Siguiente', handler: (asignaturaId) => this.formRecordatorio(asignaturaId) }
      ]
    });
    await selectAsig.present();
  }

  private async formRecordatorio(asignaturaId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo recordatorio',
      inputs: [
        { name: 'titulo', placeholder: 'Título del recordatorio', type: 'text' },
        { name: 'fechaLimite', type: 'datetime-local', min: new Date().toISOString().slice(0, 16) },
        {
          name: 'prioridad',
          type: 'radio' as any,
          label: 'Alta',
          value: 'alta'
        },
        {
          name: 'prioridad',
          type: 'radio' as any,
          label: 'Media',
          value: 'media',
          checked: true
        },
        {
          name: 'prioridad',
          type: 'radio' as any,
          label: 'Baja',
          value: 'baja'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.titulo?.trim()) return false;
            const nuevo: Recordatorio = {
              id: uuidv4(),
              titulo: data.titulo,
              fechaLimite: new Date(data.fechaLimite || Date.now()),
              prioridad: data.prioridad || 'media',
              asignaturaId,
              completado: false
            };
            await this.recordatorioService.addRecordatorio(nuevo);
            await this.cargarDatos();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarRecordatorio(id: string) {
    const confirm = await this.alertCtrl.create({
      header: 'Eliminar',
      message: '¿Eliminar este recordatorio?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.recordatorioService.deleteRecordatorio(id);
            await this.cargarDatos();
          }
        }
      ]
    });
    await confirm.present();
  }

  async actualizarCompletado(rec: Recordatorio) {
    await this.recordatorioService.updateRecordatorio(rec.id, rec);
  }
}
