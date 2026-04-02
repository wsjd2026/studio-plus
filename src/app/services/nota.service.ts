import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Nota } from '../models/nota.model';

@Injectable({ providedIn: 'root' })
export class NotaService {

  constructor(private db: DatabaseService) {}

  async getNotas(): Promise<Nota[]> {
    const rows = await this.db.query('SELECT * FROM notas ORDER BY fecha_modificacion DESC');
    return rows.map((r: any) => ({
      id: r.id,
      titulo: r.titulo,
      contenido: r.contenido,
      fechaModificacion: new Date(r.fecha_modificacion),
      sincronizada: r.sincronizada === 1
    }));
  }

  async addNota(nota: Nota): Promise<void> {
    await this.db.run(
      'INSERT INTO notas (id, titulo, contenido, fecha_modificacion, sincronizada) VALUES (?, ?, ?, ?, ?)',
      [nota.id, nota.titulo, nota.contenido, nota.fechaModificacion.toISOString(), 0]
    );
    await this.enqueueSync('notas', 'INSERT', nota);
  }

  async updateNota(id: string, updated: Nota): Promise<void> {
    await this.db.run(
      'UPDATE notas SET titulo = ?, contenido = ?, fecha_modificacion = ?, sincronizada = ? WHERE id = ?',
      [updated.titulo, updated.contenido, updated.fechaModificacion.toISOString(), 0, id]
    );
    await this.enqueueSync('notas', 'UPDATE', updated);
  }

  async deleteNota(id: string): Promise<void> {
    await this.db.run('DELETE FROM notas WHERE id = ?', [id]);
    await this.enqueueSync('notas', 'DELETE', { id });
  }

  async marcarSincronizadas(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    await this.db.run(
      `UPDATE notas SET sincronizada = 1 WHERE id IN (${placeholders})`,
      ids
    );
  }

  async getNotasPendientes(): Promise<Nota[]> {
    const rows = await this.db.query('SELECT * FROM notas WHERE sincronizada = 0');
    return rows.map((r: any) => ({
      id: r.id,
      titulo: r.titulo,
      contenido: r.contenido,
      fechaModificacion: new Date(r.fecha_modificacion),
      sincronizada: false
    }));
  }

  private async enqueueSync(tabla: string, operacion: string, datos: any): Promise<void> {
    await this.db.run(
      'INSERT INTO sync_queue (tabla, operacion, datos, created_at) VALUES (?, ?, ?, ?)',
      [tabla, operacion, JSON.stringify(datos), new Date().toISOString()]
    );
  }
}
