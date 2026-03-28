import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements AfterViewInit {
  map: L.Map | null = null;
  campusCenter: L.LatLngExpression = [19.4326, -99.1332];
  edificios: { nombre: string; coords: L.LatLngExpression; descripcion?: string }[] = [
    { nombre: 'Biblioteca Central', coords: [19.4326, -99.1332], descripcion: 'Horario: 8am-8pm' },
    { nombre: 'Laboratorio de Computación', coords: [19.4330, -99.1325], descripcion: 'Sala 301' },
    { nombre: 'Facultad de Ingeniería', coords: [19.4320, -99.1340], descripcion: 'Edificio A' }
  ];

  ngAfterViewInit() {
    this.loadMap();
  }

  loadMap() {
    if (!this.map) {
      this.map = L.map('map').setView(this.campusCenter, 17);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
      this.agregarMarcadores();
    }
  }

  agregarMarcadores() {
    if (!this.map) return;
    this.edificios.forEach(ed => {
      const marker = L.marker(ed.coords as L.LatLngExpression).addTo(this.map!);
      marker.bindPopup(`
        <b>${ed.nombre}</b><br>
        ${ed.descripcion || ''}<br>
        <button onclick="window.open('https://maps.google.com/?q=${ed.coords[0]},${ed.coords[1]}', '_system')">
          Cómo llegar
        </button>
      `);
    });
  }

  async centrarEnMiUbicacion() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      if (this.map) {
        this.map.setView([latitude, longitude], 17);
      }
    } catch (error) {
      console.error('Error obteniendo ubicación', error);
    }
  }
}
