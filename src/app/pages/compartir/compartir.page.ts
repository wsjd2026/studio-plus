import { Component, OnInit, OnDestroy } from '@angular/core';
import { MaterialService } from '../../services/material.service';
import { AsignaturaService } from '../../services/asignatura.service';
import { BluetoothService, DispositivoBLE } from '../../services/bluetooth.service';
import { Material } from '../../models/material.model';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-compartir',
  templateUrl: './compartir.page.html',
  styleUrls: ['./compartir.page.scss'],
})
export class CompartirPage implements OnInit, OnDestroy {
  materiales: Material[] = [];
  asignaturas: any[] = [];
  devices: DispositivoBLE[] = [];
  isScanning = false;
  bleAvailable = false;
  materialSeleccionado: Material | null = null;

  private devicesSub!: Subscription;
  private scanningSub!: Subscription;

  constructor(
    private materialService: MaterialService,
    private asignaturaService: AsignaturaService,
    private bluetoothService: BluetoothService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
    this.bleAvailable = await this.bluetoothService.initialize();

    this.devicesSub = this.bluetoothService.devices$.subscribe(devices => {
      this.devices = devices;
    });
    this.scanningSub = this.bluetoothService.isScanning$.subscribe(scanning => {
      this.isScanning = scanning;
    });
  }

  ngOnDestroy() {
    this.devicesSub?.unsubscribe();
    this.scanningSub?.unsubscribe();
    this.bluetoothService.stopScan();
  }

  async cargarDatos() {
    this.materiales = await this.materialService.getMateriales();
    this.asignaturas = await this.asignaturaService.getAsignaturas();
  }

  obtenerNombreAsignatura(asignaturaId: string): string {
    const asignatura = this.asignaturas.find(a => a.id === asignaturaId);
    return asignatura ? asignatura.nombre : 'Sin asignatura';
  }

  seleccionarMaterial(material: Material) {
    this.materialSeleccionado = material;
  }

  async escanearDispositivos() {
    if (!this.bleAvailable) {
      const alert = await this.alertCtrl.create({
        header: 'Bluetooth no disponible',
        message: 'Activa el Bluetooth en la configuración de tu dispositivo para buscar compañeros cercanos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    await this.bluetoothService.scanDevices();
  }

  async detenerEscaneo() {
    await this.bluetoothService.stopScan();
  }

  async enviarPorBLE(device: DispositivoBLE) {
    if (!this.materialSeleccionado) {
      const alert = await this.alertCtrl.create({
        header: 'Sin material',
        message: 'Selecciona un material antes de enviarlo.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: `Conectando con ${device.name}...`
    });
    await loading.present();

    const connected = await this.bluetoothService.connectToDevice(device.deviceId);
    if (!connected) {
      await loading.dismiss();
      return;
    }

    loading.message = 'Enviando material...';

    const payload = JSON.stringify({
      tipo: this.materialSeleccionado.tipo,
      fecha: this.materialSeleccionado.fecha,
      asignatura: this.obtenerNombreAsignatura(this.materialSeleccionado.asignaturaId),
      url: this.materialSeleccionado.url
    });

    const success = await this.bluetoothService.sendData(device.deviceId, payload);
    await this.bluetoothService.disconnect(device.deviceId);
    await loading.dismiss();

    const alert = await this.alertCtrl.create({
      header: success ? 'Enviado' : 'Error',
      message: success
        ? `Material enviado a ${device.name} correctamente.`
        : 'No se pudo enviar el material. Intenta de nuevo.',
      buttons: ['OK']
    });
    await alert.present();
  }

  // Fallback: compartir usando la API Share nativa del sistema
  async compartirPorShare(material: Material) {
    await this.bluetoothService.compartirPorShare(
      material.url,
      `apunte_${material.fecha}.jpg`
    );
  }
}
