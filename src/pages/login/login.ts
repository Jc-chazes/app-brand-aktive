import {Component} from '@angular/core';
import {NavController, Loading, LoadingController, AlertController} from 'ionic-angular';
import {TabsPage} from "../tabs/tabs";
import {AuthService} from "../../services/auth.service";
import {AppService} from "../../services/app.service";
import {SignupPage} from "../signup/signup";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import { NotificationsService } from '../../services/notifications.service';
import { AppStateService } from '../../services/app-state.service';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage {

    loading: Loading;
    user : any = {
        email : "",
        password: ""
    };

    constructor(
        public navCtrl: NavController,
        private loadingCtrl: LoadingController,
        private alertCtrl: AlertController,
        private authService: AuthService,
        private appService: AppService,
        public ga: GoogleAnalytics,
        private notificationsService: NotificationsService,
        private appStateService: AppStateService) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('loginPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    validateLogin(){
        const regexEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        if(this.user.email == "" || this.user.password == ""){
            let alert = this.alertCtrl.create({
                title: `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Uy...'+`</h6>`,
                message: 'Por favor completa los campos',
                buttons: ['OK']
            });
            alert.present();
        }
        else if(!regexEmail.test(this.user.email)){
            let alert = this.alertCtrl.create({
                title: `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Uy...'+`</h6>`,
                message: 'Por favor ingresa un correo electrónico válido',
                buttons: ['OK']
            });
            alert.present();
        }
        else{
            this.showLoading();
            this.authService.login(this.user)
                .subscribe(
                    success =>{
                        this.loading.dismiss();

                        if(success.data.length > 0){
                            localStorage.setItem( 'id_token', success.token);
                            localStorage.setItem('QR', success.data[0].QRApp);
                            if(success.data.length == 1){

                                console.log('EST', success.data[0].establishmentId);
                                console.log('SET', this.appService.setEstablishmentId);

                                if(success.data[0].establishmentId == this.appService.setEstablishmentId){
                                    localStorage.setItem('userLogged',JSON.stringify(success.data[0]));
                                    localStorage.setItem('QR', success.data[0].QRApp);
                                    this.authService.userLogged = success.data[0];
                                    this.authService.establishmentId = success.data[0].establishmentId;
                                    this.authService.userId = success.data[0].id;
                                    localStorage.setItem('statusLimitMembershipTest', success.data[0].statusLimitMembershipTest);
                                    localStorage.setItem('statusNotificationMobile', success.data[0].statusNotificationMobile);
                                    if(success.data[0].statusNotificationMobile == 'Y'){
                                      this.notificationsService.getUnreadNotifications()
                                      .subscribe(
                                          success => {

                                            localStorage.setItem('unreadNotificationsCount', success.unread);
                                            this.appStateService.setState({
                                              notifications: {
                                                unreadCount: success.unread
                                            } });
                                          },
                                          error => {
                                              let err = error.json();

                                          });
                                    }

                                    this.ga.startTrackerWithId('UA-76827860-10')
                                        .then(() => {
                                            console.log('Google analytics is ready now');
                                            this.ga.trackEvent('Usuario', 'inicia sesión', this.authService.userLogged.establishmentName +' / '+ this.authService.establishmentId);
                                        })
                                        .catch(e => console.log('Error starting GoogleAnalytics', e));

                                    this.navCtrl.setRoot(TabsPage);
                                }
                                else{
                                    let alert = this.alertCtrl.create({
                                        title: `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Ups...'+`</h6>`,
                                        message: 'Tu usuario no pertenece a este centro.',
                                        buttons: ['OK']
                                    });
                                    alert.present();
                                }
                            }
                            else if(success.data.length > 1){

                                for(let elem of success.data){

                                    if(elem.establishmentId == this.appService.setEstablishmentId){

                                        localStorage.setItem('userLogged',JSON.stringify(elem));
                                        localStorage.setItem('QR', elem.QRApp);
                                        this.authService.userLogged = elem;
                                        this.authService.establishmentId = elem.establishmentId;
                                        this.authService.userId = elem.id;

                                        this.ga.startTrackerWithId('UA-76827860-10')
                                            .then(() => {
                                                console.log('Google analytics is ready now');
                                                this.ga.trackEvent('Usuario', 'inicia sesión', this.authService.userLogged.establishmentName +' / '+ this.authService.establishmentId);
                                            })
                                            .catch(e => console.log('Error starting GoogleAnalytics', e));

                                        this.navCtrl.setRoot(TabsPage);
                                    }
                                }
                            }
                        }
                        else if(success.data.length == 0){
                            let alert = this.alertCtrl.create({
                                title: `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Ups...'+`</h6>`,
                                message: 'Tu usuario no está asociado a tu centro.',
                                buttons: ['OK']
                            });
                            alert.present();
                        }
                    },
                    error=>{
                        
                        window.alert(JSON.stringify(error));

                        this.loading.dismiss();

                        let err = error.error;
                        let message = "";

                        switch (err.title) {
                            case "ERROR_DB_BODY":
                                message = "Error de conexión";
                                break;
                            case "USER_NO_FOUND":
                                message = "Verifica tus datos por favor";
                                break;
                            case "CLIENTES.ALERTAS.USER_NO_FOUND":
                                message = "Usuario no encontrado";
                                break;
                        }

                        let alert = this.alertCtrl.create({
                            title: `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'Ups...'+`</h6>`,
                            message: message,
                            buttons: ['OK']
                        });
                        alert.present();
                    }
                );
        }

    }

    showLoading() {
        this.loading = this.loadingCtrl.create({
            content: 'Un momento...',
            enableBackdropDismiss: false
        });
        this.loading.present();
    }

    goToSignUp(){
        this.navCtrl.push(SignupPage);
    }

}
