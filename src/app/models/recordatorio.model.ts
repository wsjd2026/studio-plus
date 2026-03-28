export interface Recordatorio {
  id: string;
  titulo: string;
  fechaLimite: Date;
  prioridad: 'alta' | 'media' | 'baja';
  asignaturaId: string;
  completado: boolean;
}
