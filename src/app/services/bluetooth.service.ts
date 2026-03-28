import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Injectable({ providedIn: 'root' })
export class BluetoothService {
  constructor(private alertCtrl: AlertController) {}

  // Simulación de transferencia Bluetooth (realmente usa Share nativo)
  async compartirArchivo(fileUri: string, fileName: string) {
    await Share.share({
      title: 'Compartir apunte',
      text: 'Revisa este material de estudio',
      url: fileUri,
      dialogTitle: 'Compartir por...'
    });
    // En un escenario real, aquí integrarías @capacitor-community/bluetooth-le
    // pero por simplicidad usamos Share que permite Bluetooth si el sistema lo soporta.
  }

  async mostrarInfoBluetooth() {
    const alert = await this.alertCtrl.create({
      header: 'Bluetooth',
      message: 'Para compartir archivos por Bluetooth, usa el botón "Compartir" y selecciona Bluetooth en el menú nativo.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
