import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  isOnline$ = new BehaviorSubject<boolean>(true);
  private wasOffline = false;
  private onReconnectCallbacks: (() => void)[] = [];

  constructor(private zone: NgZone) {
    this.initNetworkListener();
  }

  private async initNetworkListener() {
    const status = await Network.getStatus();
    this.isOnline$.next(status.connected);
    this.wasOffline = !status.connected;

    Network.addListener('networkStatusChange', (status) => {
      this.zone.run(() => {
        const isConnected = status.connected;
        this.isOnline$.next(isConnected);

        // Si pasamos de offline a online, disparar callbacks de reconexión
        if (isConnected && this.wasOffline) {
          console.log('Conexión restaurada, iniciando sincronización...');
          this.onReconnectCallbacks.forEach(cb => cb());
        }

        this.wasOffline = !isConnected;
      });
    });
  }

  onReconnect(callback: () => void): void {
    this.onReconnectCallbacks.push(callback);
  }

  get isOnline(): boolean {
    return this.isOnline$.value;
  }
}
