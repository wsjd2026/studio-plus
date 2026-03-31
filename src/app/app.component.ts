import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DatabaseService } from './services/database.service';
import { NetworkService } from './services/network.service';
import { SyncService } from './services/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  appPages = [
    { title: 'Asignaturas', url: '/asignaturas', icon: 'book' },
    { title: 'Recordatorios', url: '/recordatorios', icon: 'alarm' },
    { title: 'Notas', url: '/notas', icon: 'document-text' },
    { title: 'Mapa', url: '/mapa', icon: 'map' },
    { title: 'Calendario', url: '/calendario', icon: 'calendar' },
    { title: 'Compartir', url: '/compartir', icon: 'share-social' },
  ];

  constructor(
    private platform: Platform,
    private databaseService: DatabaseService,
    private networkService: NetworkService,
    private syncService: SyncService
  ) {
    this.initApp();
  }

  private async initApp() {
    await this.platform.ready();

    await this.databaseService.initializeDatabase();
    await this.seedDataIfEmpty();

    if (this.networkService.isOnline) {
      this.syncService.procesarCola();
    }
  }

  private async seedDataIfEmpty() {
    const asignaturas = await this.databaseService.query('SELECT COUNT(*) as count FROM asignaturas');
    if (asignaturas[0]?.count > 0) return;

    // Datos de prueba para demostración
    const seedStatements = `
      INSERT INTO asignaturas (id, nombre, color, docente, descripcion) VALUES
        ('a1', 'Programación Móvil', '#4CAF50', 'Prof. Joan Gregorio', 'ISW-307 - Desarrollo de apps con Ionic y Angular'),
        ('a2', 'Base de Datos II', '#2196F3', 'Prof. María Santos', 'ISW-401 - Diseño y optimización de bases de datos'),
        ('a3', 'Ingeniería de Software', '#FF9800', 'Prof. Carlos Méndez', 'ISW-305 - Metodologías ágiles y patrones de diseño'),
        ('a4', 'Redes y Comunicaciones', '#9C27B0', 'Prof. Ana Rodríguez', 'ISW-310 - Protocolos de red y arquitectura TCP/IP');

      INSERT INTO notas (id, titulo, contenido, fecha_modificacion, sincronizada) VALUES
        ('n1', 'Apuntes Ionic Components', 'ion-card, ion-list, ion-item son los componentes más usados. Recordar que ion-content es el wrapper principal.', '2026-03-25T10:30:00', 0),
        ('n2', 'Patrón Repository', 'El patrón Repository abstrae el acceso a datos. En Angular se implementa con Services que inyectan el DatabaseService.', '2026-03-26T14:15:00', 0),
        ('n3', 'SQL vs NoSQL', 'SQLite es relacional y bueno para datos estructurados. Firebase Firestore es NoSQL y mejor para sync en tiempo real.', '2026-03-27T09:00:00', 1),
        ('n4', 'Capacitor Plugins', 'Los plugins de Capacitor exponen APIs nativas: Camera, Geolocation, Network, BLE. Se instalan con npm y se sincronizan con cap sync.', '2026-03-28T16:45:00', 0);

      INSERT INTO recordatorios (id, titulo, fecha_limite, prioridad, asignatura_id, completado) VALUES
        ('r1', 'Entregar Hito 3 - Funcionalidades Avanzadas', '2026-04-08T23:59:00', 'alta', 'a1', 0),
        ('r2', 'Examen parcial Base de Datos', '2026-04-10T08:00:00', 'alta', 'a2', 0),
        ('r3', 'Presentación patrones de diseño', '2026-04-05T14:00:00', 'media', 'a3', 0),
        ('r4', 'Laboratorio de redes - Práctica TCP', '2026-04-03T10:00:00', 'baja', 'a4', 0),
        ('r5', 'Entregar Hito 4 - Entrega Final', '2026-04-22T23:59:00', 'alta', 'a1', 0),
        ('r6', 'Quiz de normalización', '2026-04-12T09:00:00', 'media', 'a2', 0);

      INSERT INTO materiales (id, asignatura_id, titulo, tipo, url, fecha, sync) VALUES
        ('m1', 'a1', 'Foto pizarra - Arquitectura Ionic', 'foto', 'assets/icon/favicon.png', '2026-03-20T09:30:00', 0),
        ('m2', 'a2', 'Diagrama ER - Proyecto final', 'foto', 'assets/icon/favicon.png', '2026-03-22T11:00:00', 0),
        ('m3', 'a3', 'Apuntes UML - Clases', 'foto', 'assets/icon/favicon.png', '2026-03-24T14:30:00', 0);
    `;

    try {
      await this.databaseService.execute(seedStatements);
      console.log('Datos de prueba insertados');
    } catch (e) {
      console.error('Error insertando datos de prueba:', e);
    }
  }
}
