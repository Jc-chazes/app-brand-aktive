import {Component} from '@angular/core';
import {NavController, Events, AlertController, LoadingController, Loading} from 'ionic-angular';
import {CulqiService} from "../../services/culqi.service";
import {EstablishmentsService} from "../../services/establishments.service";
import {MembershipsService} from "../../services/memberships.service";
import {PaymentsService} from "../../services/payments.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {ShopPage} from "../shop/shop";
import * as moment from "moment";

@Component({
    selector: 'page-form-card-data',
    templateUrl: 'form-card-data.html'
})
export class FormCardDataPage {

    loading: Loading;
    plan: any;
    card = {
        number : "",
        expDate : "",
        cvv : "",
    };

    currentDate = moment().format('YYYY-MM-DD');

    usePayU: boolean;

    constructor(
        public events: Events,
        public navCtrl: NavController,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        private culqiService: CulqiService,
        private membershipsService: MembershipsService,
        private establishmentService: EstablishmentsService,
        private paymentsService: PaymentsService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('formCardDataPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    ionViewWillEnter(){
        this.validateEstablishment();
        this.plan = this.culqiService.planData;

    }

    validateEstablishment(){
        let establishmentId = this.establishmentService.selectedEstablishmentId;

        if(establishmentId == 19){
            this.usePayU = true;
        }
        else{
            this.usePayU = false;
            this.establishmentService.getEstablishmentById()
                .subscribe(
                    success =>{
                        this.establishmentService.establishmentsKeys.keyPublic = success[0].keyPublic;
                        this.establishmentService.establishmentsKeys.keyPrivate = success[0].keyPrivate;
                    }
                );
        }
    }

    startPayment(){
        if(this.card.number == "" || this.card.expDate == "" || this.card.cvv == ""){
            const alert = this.alertCtrl.create({
                title: 'Ups...',
                message: 'Por favor completa todos los campos',
                buttons: ['Ok']
            });
            alert.present();
        }
        else{
            this.culqiService.cardData = this.card;
            this.payWithCulqi();
        }

    }

    payWithCulqi(){
        this.showLoading();
        this.culqiService.createToken()
            .subscribe(
                success =>{
                    if(success.active){
                        const tokenId = success.id;
                        this.culqiService.createCharge(tokenId)
                            .subscribe(
                                data =>{
                                    if(data.object == 'charge'){
                                        this.saveMembership();
                                    }
                                    else if(data.object == 'error'){
                                        let titleAlert = `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Uy...'+`</h6>`;
                                        this.showAlert(titleAlert, "No se pudo realizar la transacción.")
                                    }
                                },
                                error =>{
                                    let titleAlert = `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Uy...'+`</h6>`;
                                    let messageAlert = error.json().user_message;
                                    this.showAlert(titleAlert, messageAlert);
                                }
                            );
                    }
                },
                error =>{
                    let titleAlert = `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Uy...'+`</h6>`;
                    let messageAlert = error.error.user_message;
                    this.showAlert(titleAlert, messageAlert);
                }
            )
    }

    saveMembership(){
        let membershipData = {
            planId: this.plan.id,
            typeMembership: "0",
            userEstablishmentId: JSON.parse(localStorage.getItem('userLogged')).id,
            sellerId: null,
            discount: 0,
            realDiscount: 0,
            startDate: this.currentDate,
            roleId: 5,
            comentaryDiscount: "Compra por app",
            insUser: JSON.parse(localStorage.getItem('userLogged')).id
        };

        this.membershipsService.createMembership(membershipData)
            .subscribe(
                success => {
                    let membershipId = success.idInserted;
                    this.savePayment(membershipId);
                },
                error =>{
                    let titleError = `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Ups...'+`</h6>`;
                    let messageError = 'Hubo un error al momento de registrar tu membresía. Por favor toma una captura de pantalla y acercate a tu centro.';
                    this.showAlert(titleError, messageError);
                }

            )

    }

    savePayment(membershipId){
        let paymentData = {
            establishmentId: this.establishmentService.selectedEstablishmentId,
            membershipId: membershipId,
            amount: this.plan.price,
            comment: "compra por app",
            insUser: JSON.parse(localStorage.getItem('userLogged')).id
        }

        this.paymentsService.createPayment(paymentData)
            .subscribe(
                success =>{
                    this.showSuccess();
                }
                ,error =>{
                    let titleError = `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Ups...'+`</h6>`;
                    let messageError = 'Hubo un error al momento de registrar tu pago. Por favor toma una captura de pantalla y acercate a tu centro.';
                    this.showAlert(titleError, messageError);
                }
            )

    }

    showSuccess(){
        this.loading.dismiss();
        const congratulations = this.alertCtrl.create({
            title: `<img src="assets/images/success.png" class="icon-booking"> <h6 class="title-booking">`+'¡HURRA!'+`</h6>`,
            message: 'Tu compra se realizó satisfactoriamente',
            buttons: [{
                text: 'Ok',
                handler: () => {
                    //this.events.publish('gototab');
                    this.navCtrl.setRoot(ShopPage);
                }
            }]
        });
        congratulations.present();
    }

    showAlert(title, message){
        this.loading.dismiss();
        const alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: ['Ok']
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
