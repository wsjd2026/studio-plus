import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Asignatura } from '../models/asignatura.model';

@Injectable({ providedIn: 'root' })
export class AsignaturaService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  async getAsignaturas(): Promise<Asignatura[]> {
    return (await this._storage?.get('asignaturas')) || [];
  }

  async addAsignatura(asignatura: Asignatura): Promise<void> {
    const asignaturas = await this.getAsignaturas();
    asignaturas.push(asignatura);
    await this._storage?.set('asignaturas', asignaturas);
  }

  async updateAsignatura(id: string, updated: Asignatura): Promise<void> {
    let asignaturas = await this.getAsignaturas();
    asignaturas = asignaturas.map(a => a.id === id ? updated : a);
    await this._storage?.set('asignaturas', asignaturas);
  }

  async deleteAsignatura(id: string): Promise<void> {
    let asignaturas = await this.getAsignaturas();
    asignaturas = asignaturas.filter(a => a.id !== id);
    await this._storage?.set('asignaturas', asignaturas);
  }
}
