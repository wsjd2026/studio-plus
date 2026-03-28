import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Material } from '../models/material.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  async getMateriales(): Promise<Material[]> {
    return (await this._storage?.get('materiales')) || [];
  }

  async getMaterialesPorAsignatura(asignaturaId: string): Promise<Material[]> {
    const all = await this.getMateriales();
    return all.filter(m => m.asignaturaId === asignaturaId);
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
      data: image.webPath!.split(',')[1] || '', // en producción usar base64
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

    const materiales = await this.getMateriales();
    materiales.push(material);
    await this._storage?.set('materiales', materiales);

    return material;
  }

  async deleteMaterial(id: string): Promise<void> {
    let materiales = await this.getMateriales();
    const toDelete = materiales.find(m => m.id === id);
    if (toDelete) {
      await Filesystem.deleteFile({ path: toDelete.url, directory: Directory.Data });
    }
    materiales = materiales.filter(m => m.id !== id);
    await this._storage?.set('materiales', materiales);
  }
}
