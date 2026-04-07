
import { Component } from '@angular/core';
import { RecordatorioService } from '../../services/recordatorio.service';
import { AsignaturaService } from '../../services/asignatura.service';
import { Recordatorio } from '../../models/recordatorio.model';
import { Asignatura } from '../../models/asignatura.model';
import { AlertController } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';
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
        {
          text: 'Siguiente',
          handler: (asignaturaId) => this.formRecordatorio(asignaturaId)
        }
      ]
    });

    await selectAsig.present();
  }

  private async formRecordatorio(asignaturaId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo recordatorio',
      inputs: [
        {
          name: 'titulo',
          placeholder: 'Título del recordatorio',
          type: 'text'
        },
        {
          name: 'fecha',
          type: 'date',
          min: new Date().toISOString().split('T')[0]
        },
        {
          name: 'hora',
          type: 'time'
        },
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
            if (!data.fecha || !data.hora) return false;

            const [anio, mes, dia] = data.fecha.split('-').map(Number);
            const [hora, minuto] = data.hora.split(':').map(Number);

            const fechaHora = new Date(anio, mes - 1, dia, hora, minuto, 0);

            const nuevo: Recordatorio = {
              id: uuidv4(),
              titulo: data.titulo,
              fechaLimite: fechaHora,
              prioridad: data.prioridad || 'media',
              asignaturaId,
              completado: false
            };

            await this.recordatorioService.addRecordatorio(nuevo);

            const permiso = await LocalNotifications.requestPermissions();

            if (permiso.display === 'granted') {
              await LocalNotifications.schedule({
                notifications: [
                  {
                    id: parseInt(nuevo.id.replace(/\D/g, '').slice(0, 6)) || Math.floor(Math.random() * 100000),
                    title: 'Recordatorio de tarea',
                    body: nuevo.titulo,
                    schedule: {
                      at: fechaHora,
                      allowWhileIdle: true
                    }
                  }
                ]
              });
            }

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

            await LocalNotifications.cancel({
              notifications: [
                {
                  id: parseInt(id.replace(/\D/g, '').slice(0, 6)) || 0
                }
              ]
            });

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

