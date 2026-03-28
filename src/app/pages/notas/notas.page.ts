import { Component, OnInit } from '@angular/core';
import { NotaService } from '../../services/nota.service';
import { Nota } from '../../models/nota.model';
import { AlertController, ModalController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-notas',
  templateUrl: './notas.page.html',
  styleUrls: ['./notas.page.scss'],
})
export class NotasPage implements OnInit {
  notas: Nota[] = [];

  constructor(
    private notaService: NotaService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarNotas();
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
    await this.notaService.syncNotas();
    this.cargarNotas();
    const alert = await this.alertCtrl.create({
      header: 'Sincronización',
      message: 'Notas sincronizadas correctamente',
      buttons: ['OK']
    });
    await alert.present();
  }
}
