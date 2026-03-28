import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Nota } from '../models/nota.model';

@Injectable({ providedIn: 'root' })
export class NotaService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  async getNotas(): Promise<Nota[]> {
    const list = (await this._storage?.get('notas')) || [];
    return list.map((n: any) => ({ ...n, fechaModificacion: new Date(n.fechaModificacion) }));
  }

  async addNota(nota: Nota): Promise<void> {
    const notas = await this.getNotas();
    notas.push(nota);
    await this._storage?.set('notas', notas);
  }

  async updateNota(id: string, updated: Nota): Promise<void> {
    let notas = await this.getNotas();
    notas = notas.map(n => n.id === id ? updated : n);
    await this._storage?.set('notas', notas);
  }

  async deleteNota(id: string): Promise<void> {
    let notas = await this.getNotas();
    notas = notas.filter(n => n.id !== id);
    await this._storage?.set('notas', notas);
  }

  async syncNotas(): Promise<void> {
    // Simular sincronización con un backend
    const notas = await this.getNotas();
    const pendientes = notas.filter(n => !n.sincronizada);
    // Aquí iría la lógica HTTP para subir
    pendientes.forEach(n => n.sincronizada = true);
    await this._storage?.set('notas', notas);
  }
}
