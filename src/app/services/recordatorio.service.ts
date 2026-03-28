import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Recordatorio } from '../models/recordatorio.model';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class RecordatorioService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
    await this.requestPermissions();
  }

  async requestPermissions() {
    await LocalNotifications.requestPermissions();
  }

  async getRecordatorios(): Promise<Recordatorio[]> {
    const list = (await this._storage?.get('recordatorios')) || [];
    return list.map((r: any) => ({ ...r, fechaLimite: new Date(r.fechaLimite) }));
  }

  async addRecordatorio(recordatorio: Recordatorio): Promise<void> {
    const recordatorios = await this.getRecordatorios();
    recordatorios.push(recordatorio);
    await this._storage?.set('recordatorios', recordatorios);

    if (recordatorio.prioridad === 'alta') {
      await LocalNotifications.schedule({
        notifications: [{
          title: recordatorio.titulo,
          body: `Fecha límite: ${recordatorio.fechaLimite.toLocaleDateString()}`,
          id: parseInt(recordatorio.id, 10) % 10000, // ID numérico
          schedule: { at: recordatorio.fechaLimite }
        }]
      });
    }
  }

  async updateRecordatorio(id: string, updated: Recordatorio): Promise<void> {
    let recordatorios = await this.getRecordatorios();
    recordatorios = recordatorios.map(r => r.id === id ? updated : r);
    await this._storage?.set('recordatorios', recordatorios);
  }

  async deleteRecordatorio(id: string): Promise<void> {
    let recordatorios = await this.getRecordatorios();
    recordatorios = recordatorios.filter(r => r.id !== id);
    await this._storage?.set('recordatorios', recordatorios);
  }
}
