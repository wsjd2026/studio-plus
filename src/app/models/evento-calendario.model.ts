export interface EventoCalendario {
  id: string;
  titulo: string;
  fecha: Date;
  descripcion?: string;
  tipo: 'feriado' | 'academico';
}
