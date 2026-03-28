import { Component, OnInit } from '@angular/core';
import { CalendarioService } from '../../services/calendario.service';
import { EventoCalendario } from '../../models/evento-calendario.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {
  fechaSeleccionada: string = new Date().toISOString();
  eventosDelDia: EventoCalendario[] = [];
  eventos: EventoCalendario[] = [];

  constructor(
    private calendarioService: CalendarioService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.cargarEventos();
  }

  async cargarEventos() {
    // Cargar feriados (año actual)
    const year = new Date().getFullYear();
    this.calendarioService.getFeriados(year, 'DO').subscribe({
      next: (feriados) => {
        this.eventos = feriados;
        this.filtrarEventosPorFecha();
      },
      error: async (err) => {
        console.error('Error al cargar feriados', err);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudieron cargar los feriados. Usando eventos locales.',
          buttons: ['OK']
        });
        await alert.present();
        // Fallback a eventos locales
        this.calendarioService.getEventosAcademicos().subscribe(academicos => {
          this.eventos = academicos;
          this.filtrarEventosPorFecha();
        });
      }
    });

    // También puedes combinar con eventos académicos locales
    this.calendarioService.getEventosAcademicos().subscribe(academicos => {
      this.eventos = [...this.eventos, ...academicos];
      this.filtrarEventosPorFecha();
    });
  }

  filtrarEventosPorFecha() {
    const fechaObj = new Date(this.fechaSeleccionada);
    this.eventosDelDia = this.eventos.filter(evento => {
      const eventoDate = new Date(evento.fecha);
      return eventoDate.toDateString() === fechaObj.toDateString();
    });
  }

  async cargarFeriados() {
    // Forzar recarga
    this.cargarEventos();
  }
}
