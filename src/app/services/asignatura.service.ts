import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Asignatura } from '../models/asignatura.model';

@Injectable({ providedIn: 'root' })
export class AsignaturaService {

  constructor(private db: DatabaseService) {}

  async getAsignaturas(): Promise<Asignatura[]> {
    const rows = await this.db.query('SELECT * FROM asignaturas');
    return rows as Asignatura[];
  }

  async getAsignaturaById(id: string): Promise<Asignatura | null> {
    const rows = await this.db.query('SELECT * FROM asignaturas WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] as Asignatura : null;
  }

  async addAsignatura(asignatura: Asignatura): Promise<void> {
    await this.db.run(
      'INSERT INTO asignaturas (id, nombre, color, docente, descripcion) VALUES (?, ?, ?, ?, ?)',
      [asignatura.id, asignatura.nombre, asignatura.color, asignatura.docente, asignatura.descripcion]
    );
    await this.enqueueSync('asignaturas', 'INSERT', asignatura);
  }

  async updateAsignatura(id: string, updated: Asignatura): Promise<void> {
    await this.db.run(
      'UPDATE asignaturas SET nombre = ?, color = ?, docente = ?, descripcion = ? WHERE id = ?',
      [updated.nombre, updated.color, updated.docente, updated.descripcion, id]
    );
    await this.enqueueSync('asignaturas', 'UPDATE', updated);
  }

  async deleteAsignatura(id: string): Promise<void> {
    await this.db.run('DELETE FROM asignaturas WHERE id = ?', [id]);
    await this.enqueueSync('asignaturas', 'DELETE', { id });
  }

  private async enqueueSync(tabla: string, operacion: string, datos: any): Promise<void> {
    await this.db.run(
      'INSERT INTO sync_queue (tabla, operacion, datos, created_at) VALUES (?, ?, ?, ?)',
      [tabla, operacion, JSON.stringify(datos), new Date().toISOString()]
    );
  }
}
