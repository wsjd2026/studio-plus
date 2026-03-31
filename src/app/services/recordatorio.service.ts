import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Recordatorio } from '../models/recordatorio.model';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class RecordatorioService {

  constructor(private db: DatabaseService) {
    this.requestPermissions();
  }

  private async requestPermissions() {
    await LocalNotifications.requestPermissions();
  }

  async getRecordatorios(): Promise<Recordatorio[]> {
    const rows = await this.db.query('SELECT * FROM recordatorios ORDER BY fecha_limite ASC');
    return rows.map((r: any) => ({
      id: r.id,
      titulo: r.titulo,
      fechaLimite: new Date(r.fecha_limite),
      prioridad: r.prioridad,
      asignaturaId: r.asignatura_id,
      completado: r.completado === 1
    }));
  }

  async addRecordatorio(recordatorio: Recordatorio): Promise<void> {
    await this.db.run(
      'INSERT INTO recordatorios (id, titulo, fecha_limite, prioridad, asignatura_id, completado) VALUES (?, ?, ?, ?, ?, ?)',
      [
        recordatorio.id,
        recordatorio.titulo,
        recordatorio.fechaLimite.toISOString(),
        recordatorio.prioridad,
        recordatorio.asignaturaId,
        recordatorio.completado ? 1 : 0
      ]
    );

    // Programar notificación local si es prioridad alta
    if (recordatorio.prioridad === 'alta') {
      await LocalNotifications.schedule({
        notifications: [{
          title: recordatorio.titulo,
          body: `Fecha límite: ${recordatorio.fechaLimite.toLocaleDateString()}`,
          id: parseInt(recordatorio.id.replace(/\D/g, '').slice(0, 8), 10) || Date.now() % 10000,
          schedule: { at: recordatorio.fechaLimite }
        }]
      });
    }

    await this.enqueueSync('recordatorios', 'INSERT', recordatorio);
  }

  async updateRecordatorio(id: string, updated: Recordatorio): Promise<void> {
    await this.db.run(
      'UPDATE recordatorios SET titulo = ?, fecha_limite = ?, prioridad = ?, asignatura_id = ?, completado = ? WHERE id = ?',
      [
        updated.titulo,
        updated.fechaLimite.toISOString(),
        updated.prioridad,
        updated.asignaturaId,
        updated.completado ? 1 : 0,
        id
      ]
    );
    await this.enqueueSync('recordatorios', 'UPDATE', updated);
  }

  async deleteRecordatorio(id: string): Promise<void> {
    await this.db.run('DELETE FROM recordatorios WHERE id = ?', [id]);
    await this.enqueueSync('recordatorios', 'DELETE', { id });
  }

  private async enqueueSync(tabla: string, operacion: string, datos: any): Promise<void> {
    await this.db.run(
      'INSERT INTO sync_queue (tabla, operacion, datos, created_at) VALUES (?, ?, ?, ?)',
      [tabla, operacion, JSON.stringify(datos), new Date().toISOString()]
    );
  }
}
