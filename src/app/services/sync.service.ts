import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from './database.service';
import { NetworkService } from './network.service';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

interface SyncQueueItem {
  id: number;
  tabla: string;
  operacion: string;
  datos: string;
  created_at: string;
  procesado: number;
}

@Injectable({ providedIn: 'root' })
export class SyncService {
  private syncing = false;
  private apiUrl = environment.apiUrl;

  constructor(
    private db: DatabaseService,
    private http: HttpClient,
    private networkService: NetworkService
  ) {
    // Sincronizar automáticamente al recuperar conexión
    this.networkService.onReconnect(() => this.procesarCola());
  }

  async procesarCola(): Promise<{ enviados: number; fallidos: number }> {
    if (this.syncing || !this.networkService.isOnline) {
      return { enviados: 0, fallidos: 0 };
    }

    this.syncing = true;
    let enviados = 0;
    let fallidos = 0;

    try {
      const pendientes = await this.db.query(
        'SELECT * FROM sync_queue WHERE procesado = 0 ORDER BY created_at ASC'
      ) as SyncQueueItem[];

      for (const item of pendientes) {
        try {
          await this.enviarAlServidor(item);
          await this.db.run('UPDATE sync_queue SET procesado = 1 WHERE id = ?', [item.id]);
          enviados++;
        } catch (err) {
          console.warn(`Error sincronizando item ${item.id}:`, err);
          fallidos++;
        }
      }

      // Marcar notas como sincronizadas si se enviaron correctamente
      if (enviados > 0) {
        await this.db.run(
          'UPDATE notas SET sincronizada = 1 WHERE id IN (SELECT json_extract(datos, "$.id") FROM sync_queue WHERE tabla = "notas" AND procesado = 1)'
        );
      }

      console.log(`Sincronización completada: ${enviados} enviados, ${fallidos} fallidos`);
    } finally {
      this.syncing = false;
    }

    return { enviados, fallidos };
  }

  private async enviarAlServidor(item: SyncQueueItem): Promise<void> {
    const datos = JSON.parse(item.datos);
    const url = `${this.apiUrl}/${item.tabla}`;

    switch (item.operacion) {
      case 'INSERT':
        await firstValueFrom(this.http.post(url, datos));
        break;
      case 'UPDATE':
        await firstValueFrom(this.http.put(`${url}/${datos.id}`, datos));
        break;
      case 'DELETE':
        await firstValueFrom(this.http.delete(`${url}/${datos.id}`));
        break;
    }
  }

  async getPendingCount(): Promise<number> {
    const result = await this.db.query(
      'SELECT COUNT(*) as count FROM sync_queue WHERE procesado = 0'
    );
    return result[0]?.count || 0;
  }

  async limpiarCola(): Promise<void> {
    await this.db.run('DELETE FROM sync_queue WHERE procesado = 1');
  }
}
