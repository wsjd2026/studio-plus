import { Component, OnInit } from '@angular/core';
import { CalendarioService } from '../../services/calendario.service';
import { DatabaseService } from '../../services/database.service';
import { EventoCalendario } from '../../models/evento-calendario.model';
import { AlertController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {
  fechaSeleccionada: string = new Date().toISOString();
  eventosDelDia: EventoCalendario[] = [];
  todosLosEventos: EventoCalendario[] = [];
  proximosEventos: EventoCalendario[] = [];

  constructor(
    private calendarioService: CalendarioService,
    private db: DatabaseService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.cargarTodo();
  }

  async cargarTodo() {
    this.todosLosEventos = [];

    // Feriados de la API
    const year = new Date().getFullYear();
    this.calendarioService.getFeriados(year, 'DO').subscribe({
      next: (feriados) => {
        this.todosLosEventos = [...this.todosLosEventos, ...feriados];
        this.actualizarVistas();
      },
      error: () => {
        console.warn('No se pudieron cargar feriados');
      }
    });

    // Eventos académicos locales
    this.calendarioService.getEventosAcademicos().subscribe(academicos => {
      this.todosLosEventos = [...this.todosLosEventos, ...academicos];
      this.actualizarVistas();
    });
  }

  onFechaChange() {
    this.actualizarVistas();
  }

  private actualizarVistas() {
    const fechaObj = new Date(this.fechaSeleccionada);
    this.eventosDelDia = this.todosLosEventos.filter(ev => {
      const evDate = new Date(ev.fecha);
      return evDate.toDateString() === fechaObj.toDateString();
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.proximosEventos = this.todosLosEventos
      .filter(ev => new Date(ev.fecha) >= hoy)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 10);
  }

  async agregarEvento() {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo evento académico',
      inputs: [
        { name: 'titulo', placeholder: 'Título del evento', type: 'text' },
        { name: 'descripcion', placeholder: 'Descripción', type: 'textarea' },
        { name: 'fecha', type: 'datetime-local' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.titulo?.trim()) return false;
            const nuevo: EventoCalendario = {
              id: uuidv4(),
              titulo: data.titulo,
              fecha: new Date(data.fecha || Date.now()),
              tipo: 'academico',
              descripcion: data.descripcion
            };
            this.todosLosEventos.push(nuevo);
            this.actualizarVistas();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
}
