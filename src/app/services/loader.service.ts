import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor(private loadingCtrl: LoadingController) { }

  async presentLoadingSpinner(durationInMS: number): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      duration: durationInMS,
      showBackdrop: true,
      backdropDismiss: false,
      cssClass: 'loader-spinner',
    });

    loading.present();

    return loading;
  }
}
