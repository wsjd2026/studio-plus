import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotaService } from '../../services/nota.service';
import { SyncService } from '../../services/sync.service';
import { NetworkService } from '../../services/network.service';
import { Nota } from '../../models/nota.model';
import { AlertController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notas',
  templateUrl: './notas.page.html',
  styleUrls: ['./notas.page.scss'],
})
export class NotasPage implements OnInit, OnDestroy {
  notas: Nota[] = [];
  isOnline = true;
  pendingCount = 0;
  private networkSub!: Subscription;

  constructor(
    private notaService: NotaService,
    private syncService: SyncService,
    private networkService: NetworkService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.networkSub = this.networkService.isOnline$.subscribe(online => {
      this.isOnline = online;
    });
    await this.cargarNotas();
    this.pendingCount = await this.syncService.getPendingCount();
  }

  ngOnDestroy() {
    this.networkSub?.unsubscribe();
  }

  async cargarNotas() {
    this.notas = await this.notaService.getNotas();
  }

  async nuevaNota() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva nota',
      inputs: [
        { name: 'titulo', placeholder: 'Título', type: 'text' },
        { name: 'contenido', placeholder: 'Contenido', type: 'textarea' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            const nueva: Nota = {
              id: uuidv4(),
              titulo: data.titulo,
              contenido: data.contenido,
              fechaModificacion: new Date(),
              sincronizada: false
            };
            await this.notaService.addNota(nueva);
            this.cargarNotas();
            this.pendingCount = await this.syncService.getPendingCount();
          }
        }
      ]
    });
    await alert.present();
  }

  async editarNota(nota: Nota) {
    const alert = await this.alertCtrl.create({
      header: 'Editar nota',
      inputs: [
        { name: 'titulo', value: nota.titulo, placeholder: 'Título', type: 'text' },
        { name: 'contenido', value: nota.contenido, placeholder: 'Contenido', type: 'textarea' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Actualizar',
          handler: async (data) => {
            const editada: Nota = {
              ...nota,
              titulo: data.titulo,
              contenido: data.contenido,
              fechaModificacion: new Date(),
              sincronizada: false
            };
            await this.notaService.updateNota(nota.id, editada);
            this.cargarNotas();
            this.pendingCount = await this.syncService.getPendingCount();
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarNota(id: string) {
    await this.notaService.deleteNota(id);
    this.cargarNotas();
  }

  async sincronizar() {
    if (!this.isOnline) {
      const alert = await this.alertCtrl.create({
        header: 'Sin conexión',
        message: 'No hay conexión a internet. Los datos se sincronizarán automáticamente cuando se restablezca la conexión.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const resultado = await this.syncService.procesarCola();
    this.pendingCount = await this.syncService.getPendingCount();
    await this.cargarNotas();

    const alert = await this.alertCtrl.create({
      header: 'Sincronización',
      message: `Enviados: ${resultado.enviados} | Fallidos: ${resultado.fallidos}`,
      buttons: ['OK']
    });
    await alert.present();
  }
}
