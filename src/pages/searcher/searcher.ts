import {Component} from '@angular/core';
import {NavController, Loading, LoadingController, AlertController} from 'ionic-angular';
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {OnboardingPage} from "../onboarding/onboarding";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

@Component({
    selector: 'page-searcher',
    templateUrl: 'searcher.html'
})
export class SearcherPage {

    establishments: any = [
           {
              name: 'Bikram Yoga Centro',
              id: 197
           },
           {
              name: 'Bikram Yoga Providencia',
              id: 198
           }    
    ];

    loading: Loading;

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private authService: AuthService,
        private userService: UserService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('searcherPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    ionViewWillEnter(){
    }

 
    chooseEstablishment(establishment){
        this.showLoading();

        let newBody = {
            name: this.userService.userDataToCreate.name,
            lastName: this.userService.userDataToCreate.lastName,
            email: this.userService.userDataToCreate.email,
            password: this.userService.userDataToCreate.password,
            establishmentId: establishment.id,
            roleId: 5
        };

        console.log('NEW-BODY', newBody);

        this.userService.createFinalUser(newBody)
            .subscribe(
                response =>{
                    let user = {
                        email: this.userService.userDataToCreate.email,
                        password: this.userService.userDataToCreate.password
                    };

                    this.authService.login(user)
                        .subscribe(
                            success =>{
                                this.loading.dismiss();

                                if(success.data.length > 0){
                                    localStorage.setItem( 'id_token', success.token);

                                    if(success.data.length == 1){
                                        if(success.data[0].establishmentId == 197 || success.data[0].establishmentId == 198){
                                            localStorage.setItem('userLogged',JSON.stringify(success.data[0]));

                                            this.authService.userLogged = success.data[0];
                                            this.authService.establishmentId = success.data[0].establishmentId;
                                            this.authService.userId = success.data[0].id;

                                            this.ga.startTrackerWithId('UA-76827860-10')
                                                .then(() => {
                                                    console.log('Google analytics is ready now');
                                                    this.ga.trackEvent('Usuario', 'se registra', this.authService.userLogged.establishmentName +' / '+ this.authService.establishmentId);
                                                })
                                                .catch(e => console.log('Error starting GoogleAnalytics', e));

                                            this.navCtrl.setRoot(OnboardingPage);
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

                                            if(success.data[0].establishmentId == 197 || success.data[0].establishmentId == 198){
                                                localStorage.setItem('userLogged',JSON.stringify(elem));

                                                this.authService.userLogged = elem;
                                                this.authService.establishmentId = elem.establishmentId;
                                                this.authService.userId = elem.id;

                                                this.ga.startTrackerWithId('UA-76827860-10')
                                                    .then(() => {
                                                        console.log('Google analytics is ready now');
                                                        this.ga.trackEvent('Usuario', 'se registra', this.authService.userLogged.establishmentName +' / '+ this.authService.establishmentId);
                                                    })
                                                    .catch(e => console.log('Error starting GoogleAnalytics', e));

                                                this.navCtrl.push(OnboardingPage);
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
                                this.loading.dismiss();

                                let err = error.json();
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
                },
                error =>{
                    this.loading.dismiss();

                    let err = error.error;
                    let title = "";
                    let message = "";

                    switch (err.title) {
                        case "ERROR_DB_BODY":
                            title = `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+''+`</h6>`;
                            message = "Por favor verifica tu conexión a internet e intentalo nuevamente";
                            break;
                        case "CLIENTES.ERROR.USUARIO_DUPLICADO_TITULO":
                            title = `<img src="assets/images/icon-hand.png" class="icon-booking"> <h6 class="title-booking">`+'¡HOLA!'+`</h6>`;
                            message = "Ya te encuentras registrado en este establecimiento. Por favor contáctate con ellos y solicita tus accesos";
                            break;
                    }

                    let alert = this.alertCtrl.create({
                        title: title,
                        subTitle: message,
                        buttons: ['OK']
                    });
                    alert.present();
                }
            )
    }

    showLoading() {
        this.loading = this.loadingCtrl.create({
            content: 'Un momento...',
            enableBackdropDismiss: false
        });
        this.loading.present();
    }
}
