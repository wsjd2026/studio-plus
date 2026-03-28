async agregarRecordatorio() {
  const alert = await this.alertCtrl.create({
    header: 'Nuevo recordatorio',
    inputs: [
      { name: 'titulo', placeholder: 'Título', type: 'text' },
      { name: 'fechaLimite', placeholder: 'Fecha (YYYY-MM-DDTHH:mm)', type: 'datetime-local' },
      { name: 'prioridad', placeholder: 'Prioridad (alta/media/baja)', type: 'text', value: 'media' },
      { name: 'asignaturaId', placeholder: 'ID de asignatura', type: 'text' }
    ],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Guardar',
        handler: async (data) => {
          const nuevo: Recordatorio = {
            id: uuidv4(),
            titulo: data.titulo,
            fechaLimite: new Date(data.fechaLimite),
            prioridad: data.prioridad as 'alta' | 'media' | 'baja',
            asignaturaId: data.asignaturaId,
            completado: false
          };
          await this.recordatorioService.addRecordatorio(nuevo);
          this.cargarDatos();
        }
      }
    ]
  });
  await alert.present();
}
