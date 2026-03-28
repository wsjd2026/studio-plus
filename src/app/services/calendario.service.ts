import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventoCalendario } from '../models/evento-calendario.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  constructor(private http: HttpClient) {}

  // Ejemplo de API pública de feriados (podría ser la de tu país)
  getFeriados(year: number, country: string = 'DO'): Observable<EventoCalendario[]> {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;
    return this.http.get<any[]>(url).pipe(
      map(feriados => feriados.map(f => ({
        id: f.date,
        titulo: f.name,
        fecha: new Date(f.date),
        tipo: 'feriado',
        descripcion: f.localName
      })))
    );
  }

  // Mock para eventos académicos locales
  getEventosAcademicos(): Observable<EventoCalendario[]> {
    const eventos: EventoCalendario[] = [
      { id: '1', titulo: 'Entrega de proyectos', fecha: new Date(2026, 3, 15), tipo: 'academico', descripcion: 'Fecha límite proyectos finales' },
      { id: '2', titulo: 'Examen parcial', fecha: new Date(2026, 3, 20), tipo: 'academico', descripcion: 'Matemáticas' }
    ];
    return of(eventos);
  }
}
