import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventoCalendario } from '../models/evento-calendario.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  constructor(private http: HttpClient) {}

  getFeriados(year: number, country: string = 'DO'): Observable<EventoCalendario[]> {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;
    return this.http.get<any[]>(url).pipe(
      map(feriados => feriados.map(f => ({
        id: f.date,
        titulo: f.name,
        fecha: new Date(f.date),
        tipo: 'feriado' as const,
        descripcion: f.localName
      })))
    );
  }

  getEventosAcademicos(): Observable<EventoCalendario[]> {
    const eventos: EventoCalendario[] = [
      { id: 'ev1', titulo: 'Entrega Hito 3', fecha: new Date(2026, 3, 8), tipo: 'academico', descripcion: 'Funcionalidades avanzadas - ISW-307' },
      { id: 'ev2', titulo: 'Examen parcial BD II', fecha: new Date(2026, 3, 10), tipo: 'academico', descripcion: 'Temas: normalización, índices, triggers' },
      { id: 'ev3', titulo: 'Presentación Ing. Software', fecha: new Date(2026, 3, 5), tipo: 'academico', descripcion: 'Patrones de diseño - Equipo 4' },
      { id: 'ev4', titulo: 'Lab Redes - Práctica TCP', fecha: new Date(2026, 3, 3), tipo: 'academico', descripcion: 'Laboratorio 301 - Traer laptop' },
      { id: 'ev5', titulo: 'Entrega Hito 4 - Final', fecha: new Date(2026, 3, 22), tipo: 'academico', descripcion: 'Defensa final ISW-307 + APK release' },
      { id: 'ev6', titulo: 'Inicio periodo exámenes', fecha: new Date(2026, 3, 15), tipo: 'academico', descripcion: 'Semana de exámenes finales' },
      { id: 'ev7', titulo: 'Cierre trimestre', fecha: new Date(2026, 3, 30), tipo: 'academico', descripcion: 'Último día del 12° trimestre' },
      { id: 'ev8', titulo: 'Quiz normalización BD', fecha: new Date(2026, 3, 12), tipo: 'academico', descripcion: 'ISW-401 - 15 minutos' },
    ];
    return of(eventos);
  }
}
