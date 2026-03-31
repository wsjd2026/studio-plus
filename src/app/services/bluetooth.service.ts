import { Injectable, NgZone } from '@angular/core';
import { BleClient, BleDevice, ScanResult } from '@capacitor-community/bluetooth-le';
import { AlertController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { BehaviorSubject } from 'rxjs';

const ESTUDIO_PLUS_SERVICE = '0000ff01-0000-1000-8000-00805f9b34fb';
const DATA_CHARACTERISTIC = '0000ff02-0000-1000-8000-00805f9b34fb';

export interface DispositivoBLE {
  deviceId: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class BluetoothService {
  devices$ = new BehaviorSubject<DispositivoBLE[]>([]);
  isScanning$ = new BehaviorSubject<boolean>(false);
  bleAvailable = false;

  private connectedDeviceId: string | null = null;

  constructor(
    private alertCtrl: AlertController,
    private zone: NgZone
  ) {}

  async initialize(): Promise<boolean> {
    try {
      await BleClient.initialize({ androidNeverForLocation: false });
      const enabled = await BleClient.isEnabled();
      this.bleAvailable = enabled;
      return enabled;
    } catch (err) {
      console.warn('BLE no disponible:', err);
      this.bleAvailable = false;
      return false;
    }
  }

  async scanDevices(): Promise<void> {
    if (!this.bleAvailable) {
      await this.mostrarError('Bluetooth no está activado. Actívalo en Configuración.');
      return;
    }

    this.devices$.next([]);
    this.isScanning$.next(true);

    try {
      await BleClient.requestLEScan({}, (result: ScanResult) => {
        this.zone.run(() => {
          const device: DispositivoBLE = {
            deviceId: result.device.deviceId,
            name: result.device.name || result.localName || 'Dispositivo desconocido'
          };

          const current = this.devices$.value;
          const exists = current.find(d => d.deviceId === device.deviceId);
          if (!exists) {
            this.devices$.next([...current, device]);
          }
        });
      });

      // Detener escaneo después de 10 segundos
      setTimeout(() => this.stopScan(), 10000);
    } catch (err) {
      console.error('Error escaneando:', err);
      this.isScanning$.next(false);
      await this.mostrarError('Error al escanear dispositivos BLE.');
    }
  }

  async stopScan(): Promise<void> {
    try {
      await BleClient.stopLEScan();
    } catch (e) {
      // Puede fallar si ya se detuvo
    }
    this.isScanning$.next(false);
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      await BleClient.connect(deviceId, () => {
        this.zone.run(() => {
          this.connectedDeviceId = null;
          console.log('Dispositivo desconectado:', deviceId);
        });
      });
      this.connectedDeviceId = deviceId;
      return true;
    } catch (err) {
      console.error('Error conectando:', err);
      await this.mostrarError('No se pudo conectar al dispositivo.');
      return false;
    }
  }

  async sendData(deviceId: string, data: string): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(data);

      // BLE tiene límite de MTU (~512 bytes), enviamos en chunks
      const chunkSize = 500;
      for (let i = 0; i < encoded.length; i += chunkSize) {
        const chunk = encoded.slice(i, i + chunkSize);
        await BleClient.write(
          deviceId,
          ESTUDIO_PLUS_SERVICE,
          DATA_CHARACTERISTIC,
          new DataView(chunk.buffer)
        );
      }
      return true;
    } catch (err) {
      console.error('Error enviando datos:', err);
      return false;
    }
  }

  async disconnect(deviceId: string): Promise<void> {
    try {
      await BleClient.disconnect(deviceId);
    } catch (e) {
      console.warn('Error desconectando:', e);
    }
    this.connectedDeviceId = null;
  }

  // Fallback usando la API Share nativa
  async compartirPorShare(fileUri: string, fileName: string): Promise<void> {
    await Share.share({
      title: 'Compartir apunte',
      text: 'Revisa este material de estudio',
      url: fileUri,
      dialogTitle: 'Compartir por...'
    });
  }

  private async mostrarError(mensaje: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Bluetooth',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}
