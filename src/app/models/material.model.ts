export interface Material {
  id: string;
  asignaturaId: string;
  titulo?: string;
  tipo: 'foto' | 'archivo';
  url: string;        // Ruta local del archivo
  fecha: Date;
  sync: boolean;      // Marcador para sincronización (opcional)
}
