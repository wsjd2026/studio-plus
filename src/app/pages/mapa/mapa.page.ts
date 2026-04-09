// import { Component, AfterViewInit } from '@angular/core';
// import * as L from 'leaflet';
// import { Geolocation } from '@capacitor/geolocation';
// import { AlertController } from '@ionic/angular';

// @Component({
//   selector: 'app-mapa',
//   templateUrl: './mapa.page.html',
//   styleUrls: ['./mapa.page.scss'],
// })
// export class MapaPage implements AfterViewInit {
//   map: L.Map | null = null;
//   campusCenter: [number, number] = [19.4517, -70.6830];

//   edificios: { nombre: string; coords: [number, number]; descripcion?: string }[] = [
//     { nombre: 'UAPA - Sede Santiago', coords: [19.4517, -70.6830], descripcion: 'Edificio principal' },
//     { nombre: 'Biblioteca UAPA', coords: [19.4520, -70.6825], descripcion: 'Horario: 8am-9pm' },
//     { nombre: 'Laboratorio de Computación', coords: [19.4515, -70.6835], descripcion: 'Lab 1 y Lab 2' },
//     { nombre: 'Auditorio', coords: [19.4522, -70.6832], descripcion: 'Eventos y conferencias' },
//     { nombre: 'Cafetería', coords: [19.4513, -70.6828], descripcion: 'Planta baja' }
//   ];

//   constructor(private alertCtrl: AlertController) {}

//   ngAfterViewInit() {
//     setTimeout(() => this.loadMap(), 300);
//   }

//   loadMap() {
//     if (!this.map) {
//       this.map = L.map('map').setView(this.campusCenter, 17);
//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; OpenStreetMap contributors'
//       }).addTo(this.map);
//       this.agregarMarcadores();
//     }
//   }

//   agregarMarcadores() {
//     if (!this.map) return;
//     this.edificios.forEach(ed => {
//       const marker = L.marker(ed.coords).addTo(this.map!);
//       marker.bindPopup(`
//         <b>${ed.nombre}</b><br>
//         ${ed.descripcion || ''}<br>
//         <a href="https://maps.google.com/?q=${ed.coords[0]},${ed.coords[1]}" target="_system">
//           Cómo llegar
//         </a>
//       `);
//     });
//   }

//   async centrarEnMiUbicacion() {
//     try {
//       const position = await Geolocation.getCurrentPosition();
//       const { latitude, longitude } = position.coords;
//       if (this.map) {
//         this.map.setView([latitude, longitude], 17);
//         L.marker([latitude, longitude]).addTo(this.map)
//           .bindPopup('<b>Mi ubicación</b>').openPopup();
//       }
//     } catch (error) {
//       const alert = await this.alertCtrl.create({
//         header: 'Ubicación',
//         message: 'No se pudo obtener tu ubicación. Verifica que el GPS esté activado.',
//         buttons: ['OK']
//       });
//       await alert.present();
//     }
//   }
// }

import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements AfterViewInit {

  // ============================
  // VARIABLES DEL MAPA
  // ============================
  map: L.Map | null = null;
  campusCenter: [number, number] = [19.4517, -70.6830];

  // ============================
  // VARIABLES NUEVAS DEL DISEÑO UI/UX
  // ============================
  busqueda: string = '';

  filtros = [
    { id: 'aulas', nombre: 'Aulas', icon: 'school-outline' },
    { id: 'lab', nombre: 'Laboratorios', icon: 'flask-outline' },
    { id: 'biblioteca', nombre: 'Biblioteca', icon: 'library-outline' },
    { id: 'cafeteria', nombre: 'Cafetería', icon: 'cafe-outline' },
    { id: 'admin', nombre: 'Administración', icon: 'business-outline' }
  ];

  filtroSeleccionado: string | null = null;

  lugarSeleccionado: any = null;

  // ============================
  // LISTA DE EDIFICIOS
  // ============================
  edificios: {
    id: string;
    nombre: string;
    coords: [number, number];
    descripcion?: string;
    tipo?: string;
    imagen?: string;
  }[] = [
    {
      id: 'uapa',
      nombre: 'UAPA - Sede Santiago',
      coords: [19.4517, -70.6830],
      descripcion: 'Edificio principal',
      tipo: 'admin',
      imagen: 'assets/img/uapa.jpg'
    },
    {
      id: 'biblioteca',
      nombre: 'Biblioteca UAPA',
      coords: [19.4520, -70.6825],
      descripcion: 'Horario: 8am - 9pm',
      tipo: 'biblioteca',
      imagen: 'assets/img/biblioteca.jpg'
    },
    {
      id: 'lab',
      nombre: 'Laboratorio de Computación',
      coords: [19.4515, -70.6835],
      descripcion: 'Lab 1 y Lab 2',
      tipo: 'lab',
      imagen: 'assets/img/lab.jpg'
    },
    {
      id: 'auditorio',
      nombre: 'Auditorio',
      coords: [19.4522, -70.6832],
      descripcion: 'Eventos y conferencias',
      tipo: 'aulas',
      imagen: 'assets/img/auditorio.jpg'
    },
    {
      id: 'cafeteria',
      nombre: 'Cafetería',
      coords: [19.4513, -70.6828],
      descripcion: 'Planta baja',
      tipo: 'cafeteria',
      imagen: 'assets/img/cafeteria.jpg'
    }
  ];

  constructor(private alertCtrl: AlertController) {}

  // ============================
  // INICIALIZAR MAPA
  // ============================
  ngAfterViewInit() {
    setTimeout(() => this.loadMap(), 300);
  }

  loadMap() {
    if (!this.map) {
      this.map = L.map('map').setView(this.campusCenter, 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.agregarMarcadores();
    }
  }

  // ============================
  // AGREGAR MARCADORES
  // ============================
  agregarMarcadores() {
    if (!this.map) return;

    this.edificios.forEach(ed => {
      const marker = L.marker(ed.coords).addTo(this.map!);

      marker.on('click', () => {
        this.lugarSeleccionado = ed;
      });
    });
  }

  // ============================
  // CENTRAR EN MI UBICACIÓN
  // ============================
  async centrarEnMiUbicacion() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      if (this.map) {
        this.map.setView([latitude, longitude], 17);

        L.marker([latitude, longitude])
          .addTo(this.map)
          .bindPopup('<b>Mi ubicación</b>')
          .openPopup();
      }
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Ubicación',
        message: 'No se pudo obtener tu ubicación. Verifica que el GPS esté activado.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  // ============================
  // FILTRAR LUGARES
  // ============================
  filtrarLugares() {
    const texto = this.busqueda.toLowerCase();

    const resultados = this.edificios.filter(ed =>
      ed.nombre.toLowerCase().includes(texto) ||
      ed.descripcion?.toLowerCase().includes(texto)
    );

    console.log('Resultados búsqueda:', resultados);
  }

  // ============================
  // SELECCIONAR FILTRO
  // ============================
  seleccionarFiltro(id: string) {
    this.filtroSeleccionado = id;

    const filtrados = this.edificios.filter(ed => ed.tipo === id);

    console.log('Filtrados por:', id, filtrados);
  }

  // ============================
  // CERRAR TARJETA INFORMATIVA
  // ============================
  cerrarInfo() {
    this.lugarSeleccionado = null;
  }
}
