import {Component} from '@angular/core';
import {NavController, LoadingController, Loading, AlertController} from 'ionic-angular';
import {ReservesPage} from "../reserves/reserves";
import {LessonsService} from "../../services/lessons.service";
import {ReservesService} from "../../services/reserves.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {AuthService} from "../../services/auth.service";

@Component({
    selector: 'page-lesson-detail',
    templateUrl: 'lesson-detail.html'
})
export class LessonDetailPage {

    lesson : any;
    loading: Loading;

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private authService: AuthService,
        private loadingCtrl: LoadingController,
        private lessonsService: LessonsService,
        private reservesService: ReservesService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('lessonDetailPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    ionViewWillEnter(){
        this.lesson = this.lessonsService.lessonDetail;
    }

    showSimpleRerserveAlert(lesson){
        let messageAlert = lesson.disciplineName+" a las "+lesson.start+" el "+lesson.date;
        let alert = this.alertCtrl.create({
            title: `<img src="assets/images/booking.png" class="icon-booking">
                    <p class="title-booking">¿QUIERES RESERVAR UN CUPO?</p>`,
            message: messageAlert,
            buttons: [
                {
                    text: 'CONFIRMAR',
                    handler: () => {
                        this.doSimpleReserve(lesson);
                    }
                }
            ]
        });
        alert.present();
    }

    doSimpleReserve(lesson){
        this.showLoading();

        this.reservesService.createReserve(lesson.id)
            .subscribe(
                success =>{
                    this.loading.dismiss();
                    this.successReserve('¡Reserva exitosa!','Tu reserva se realizó satisfactoriamente');

                    this.ga.startTrackerWithId('UA-76827860-8')
                        .then(() => {
                            console.log('Google analytics is ready now');
                            this.ga.trackEvent('Reservas', 'crear', this.authService.userLogged.establishmentName+' / '+ this.authService.establishmentId +' / '+lesson.dsciplineName, 1);
                        })
                        .catch(e => console.log('Error starting GoogleAnalytics', e));
                },
                error =>{
                    this.loading.dismiss();

                    let err = error.error;
                    let message = "";

                    switch (err.title) {
                        case "RESERVES.ERROR_MEMBERSHIPS":
                            message = "Uy... no cuentas con una membresía activa para esta disciplina";
                            break;
                        case "RESERVES.ERROR_RESERVES":
                            message = "El cliente ya cuenta con una reserva";
                            break;
                        case "RESERVES.ERROR_CLOSED":
                            message = "La clase se encuentra dictada";
                            break;
                        case "RESERVES.ERROR_OCCUPANCY":
                            message = "Uy... ya no quedan cupos disponibles. Prueba con otra clase por favor";
                            break;
                        case "ERROR_LIMIT_RESERVE":
                            message = "Uy... tu centro no te permite realizar una reserva para esta clase. Por favor contáctate con ellos para que puedan ayudarte.";
                            break;
                        case "RESERVES.ERROR_SESSIONS":
                            message = "Uy... ya consumiste todas las sesiones disponibles de tu membresía. Contáctate con tu centro para que puedas comprar más";
                            break;
                        case "RESERVES.ERROR_SESSION_LESSON":
                            message = "Uy... ya consumiste todas las sesiones disponibles para esta disciplina. Contáctate con tu centro para que puedas comprar más";
                            break;
                        case "RESERVES.ERROR_DATES":
                            message = "Uy... tu membresía ya venció. Contáctate con tu centro para que puedas comprar tu siguiente membresía";
                            break;
                        case "RESERVES.ERROR_DISCIPLINES":
                            message = "Uy... tu membresía no cuenta con esta disciplina. Si deseas poder ingresar acercate a tu centro y compra una membresía con esta disciplina asociada";
                            break;
                        case "ERROR_DB_BODY":
                            message = "Uy... hubo un problema de conexión. Por favor inténtalo nuevamente";
                            break;
                    }

                    let alert = this.alertCtrl.create({
                        title: `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'No se pudo realizar la reserva'+`</h6>`,
                        subTitle: message,
                        buttons: ['OK']
                    });
                    alert.present();
                }
            );
    }

    successReserve(titleAlert, messageAlert){
        let alert = this.alertCtrl.create({
            title: `<img src="assets/images/success.png"> <h6 class="title-booking">`+titleAlert+`</h6>`,
            message: messageAlert,
            buttons: [
                { text: 'Ok',
                    handler: () => {
                        this.navCtrl.push(ReservesPage);
                    }
                }
            ]
        });
        alert.present();
    }

    showLoading() {
        this.loading = this.loadingCtrl.create({
            content: 'Un momento...',
            enableBackdropDismiss: false
        });
        this.loading.present();
    }
}
