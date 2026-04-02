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
  map: L.Map | null = null;
  campusCenter: [number, number] = [19.4517, -70.6830];

  edificios: { nombre: string; coords: [number, number]; descripcion?: string }[] = [
    { nombre: 'UAPA - Sede Santiago', coords: [19.4517, -70.6830], descripcion: 'Edificio principal' },
    { nombre: 'Biblioteca UAPA', coords: [19.4520, -70.6825], descripcion: 'Horario: 8am-9pm' },
    { nombre: 'Laboratorio de Computación', coords: [19.4515, -70.6835], descripcion: 'Lab 1 y Lab 2' },
    { nombre: 'Auditorio', coords: [19.4522, -70.6832], descripcion: 'Eventos y conferencias' },
    { nombre: 'Cafetería', coords: [19.4513, -70.6828], descripcion: 'Planta baja' }
  ];

  constructor(private alertCtrl: AlertController) {}

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

  agregarMarcadores() {
    if (!this.map) return;
    this.edificios.forEach(ed => {
      const marker = L.marker(ed.coords).addTo(this.map!);
      marker.bindPopup(`
        <b>${ed.nombre}</b><br>
        ${ed.descripcion || ''}<br>
        <a href="https://maps.google.com/?q=${ed.coords[0]},${ed.coords[1]}" target="_system">
          Cómo llegar
        </a>
      `);
    });
  }

  async centrarEnMiUbicacion() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      if (this.map) {
        this.map.setView([latitude, longitude], 17);
        L.marker([latitude, longitude]).addTo(this.map)
          .bindPopup('<b>Mi ubicación</b>').openPopup();
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
}
