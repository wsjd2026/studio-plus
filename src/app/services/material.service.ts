import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Material } from '../models/material.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class MaterialService {

  constructor(private db: DatabaseService) {}

  async getMateriales(): Promise<Material[]> {
    const rows = await this.db.query('SELECT * FROM materiales ORDER BY fecha DESC');
    return rows.map((r: any) => ({
      id: r.id,
      asignaturaId: r.asignatura_id,
      titulo: r.titulo,
      tipo: r.tipo,
      url: r.url,
      fecha: new Date(r.fecha),
      sync: r.sync === 1
    }));
  }

  async getMaterialesPorAsignatura(asignaturaId: string): Promise<Material[]> {
    const rows = await this.db.query(
      'SELECT * FROM materiales WHERE asignatura_id = ? ORDER BY fecha DESC',
      [asignaturaId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      asignaturaId: r.asignatura_id,
      titulo: r.titulo,
      tipo: r.tipo,
      url: r.url,
      fecha: new Date(r.fecha),
      sync: r.sync === 1
    }));
  }

  async tomarFoto(asignaturaId: string): Promise<Material> {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    const fileName = `foto_${Date.now()}.jpeg`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: image.webPath!.split(',')[1] || '',
      directory: Directory.Data
    });

    const material: Material = {
      id: uuidv4(),
      asignaturaId,
      tipo: 'foto',
      url: savedFile.uri,
      fecha: new Date(),
      sync: false
    };

    await this.db.run(
      'INSERT INTO materiales (id, asignatura_id, titulo, tipo, url, fecha, sync) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [material.id, material.asignaturaId, material.titulo || null, material.tipo, material.url, material.fecha.toISOString(), 0]
    );
    await this.enqueueSync('materiales', 'INSERT', material);

    return material;
  }

  async deleteMaterial(id: string): Promise<void> {
    const rows = await this.db.query('SELECT url FROM materiales WHERE id = ?', [id]);
    if (rows.length > 0) {
      try {
        await Filesystem.deleteFile({ path: rows[0].url, directory: Directory.Data });
      } catch (e) {
        console.warn('No se pudo eliminar el archivo físico:', e);
      }
    }
    await this.db.run('DELETE FROM materiales WHERE id = ?', [id]);
    await this.enqueueSync('materiales', 'DELETE', { id });
  }

  private async enqueueSync(tabla: string, operacion: string, datos: any): Promise<void> {
    await this.db.run(
      'INSERT INTO sync_queue (tabla, operacion, datos, created_at) VALUES (?, ?, ?, ?)',
      [tabla, operacion, JSON.stringify(datos), new Date().toISOString()]
    );
  }
}
