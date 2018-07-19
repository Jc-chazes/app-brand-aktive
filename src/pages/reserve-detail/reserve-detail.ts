import {Component} from '@angular/core';
import {NavController, AlertController, Loading, LoadingController} from 'ionic-angular';
import {ReservesService} from "../../services/reserves.service";
import {ReservesPage} from "../reserves/reserves";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {AuthService} from "../../services/auth.service";
import * as moment from "moment";

@Component({
    selector: 'page-reserve-detail',
    templateUrl: 'reserve-detail.html'
})
export class ReserveDetailPage {

    reserve : any;

    loading : Loading;

    constructor(
        public navCtrl: NavController,
        private authService: AuthService,
        private alertCtrl : AlertController,
        private loadingCtrl : LoadingController,
        private reservesService: ReservesService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('reserveDetailPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    ionViewWillEnter(){
        this.reserve = this.reservesService.reserveDetail;
        console.log('RESERVA', this.reserve);
    }

    deleteReserve(){
        let alert = this.alertCtrl.create({
            title: `<img src="assets/images/error.png" class="icon-booking">
                    <p class="title-booking">¿ESTAS SEGURO DE HACER ESTO?</p>`,
            subTitle: 'Eliminarás tu clase reservada.',
            buttons: [
                {text: 'Cancelar'},
                {
                    text: 'Confirmar',
                    handler: () => {
                        this.showLoading();

                        let lessonRecordId = this.reserve.data.lessonRecordId;
                        let reserveId = this.reserve.data.id;

                        this.reservesService.deleteReserve(lessonRecordId, reserveId)
                            .subscribe(
                                success =>{
                                    this.loading.dismiss();

                                    this.ga.startTrackerWithId('UA-76827860-10')
                                        .then(() => {
                                            console.log('Google analytics is ready now');
                                            this.ga.trackEvent('Reservas', 'eliminar', this.authService.userLogged.establishmentName+' / '+ this.authService.establishmentId +' / '+this.reserve.discipline , 1);
                                        })
                                        .catch(e => console.log('Error starting GoogleAnalytics', e));

                                    let alert = this.alertCtrl.create({
                                        title: 'Reserva Eliminada',
                                        subTitle: 'Tu reserva se eliminó con éxito',
                                        buttons: [{
                                            text: 'Ok',
                                            handler: () => {this.navCtrl.popTo(ReservesPage)}
                                        }]
                                    });
                                    alert.present();
                                },
                                error =>{
                                    this.loading.dismiss();
                                    let err = error.error;
                                    let message = "";

                                    switch (err.msgApp) {
                                        case "GLOBAL.ERROR_TITULO":
                                            message = "Por favor verifica tu conexión e intentalo nuevamente.";
                                            break;
                                        case "DISCARD_LESSON_LIMIT":
                                            message = "El límite de tiempo para cancelar tu reserva fue superado.";
                                            break;
                                        case "RESERVE_ERROR_LIMIT":
                                            var limitText = moment.duration(err.limit, "minutes").asHours();
                                            message = "Tu centro permite cancelar la reserva hasta con "+limitText+" horas de anticipación. Si se trata de un caso excepcional comunicate con ellos por favor";
                                            break;
                                        case "DISCIPLINAS.ELIMINAR":
                                            message = "No se puede eliminar esta disciplina, por estar asociado a información del cliente.";
                                            break;
                                    }

                                    let alert = this.alertCtrl.create({
                                        title: `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'No se pudo eliminar la reserva'+`</h6>`,
                                        subTitle: message,
                                        buttons: ['OK']
                                    });
                                    alert.present();
                                }
                            )
                    }
                }
            ]
        });
        alert.present();
    }

    showLoading() {
        this.loading = this.loadingCtrl.create({
            content: 'Un momento...'
        });
        this.loading.present();
    }

}
