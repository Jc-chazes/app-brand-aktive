import {Component} from '@angular/core';
import {NavController, AlertController, LoadingController, Loading} from 'ionic-angular';
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {OnboardingPage} from "../onboarding/onboarding";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {AppService} from "../../services/app.service";

@Component({
    selector: 'page-signup',
    templateUrl: 'signup.html'
})
export class SignupPage {

    newUser : any = {
        name : "",
        lastName : "",
        email : "",
        password: ""
    };

    aceptTerms: boolean = false;

    loading: Loading;

    constructor(
        public navCtrl: NavController,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        private userService: UserService,
        private authService: AuthService,
        private appService: AppService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('signupPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    validateData(){
        const regexEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        if(this.newUser.name == "" || this.newUser.lastName == "" || this.newUser.email == "" || this.newUser.password == ""){
            let alert = this.alertCtrl.create({
                title: '¡Uy...!',
                message: 'Por favor completa todos los campos',
                buttons: ['OK']
            });
            alert.present();

        }
        else if(!regexEmail.test(this.newUser.email)){
            let alert = this.alertCtrl.create({
                title: '¡Uy...!',
                message: 'Por favor ingresa un correo electrónico válido',
                buttons: ['OK']
            });
            alert.present();
        }
        else if(this.aceptTerms == false){
            let alert = this.alertCtrl.create({
                title: '¡Uy...!',
                message: 'Por favor acepta los términos y condiciones para poder continuar',
                buttons: ['OK']
            });
            alert.present();
        }
        else{
            this.showLoading();

            let newBody = {
                name: this.newUser.name,
                lastName: this.newUser.lastName,
                email: this.newUser.email,
                password: this.newUser.password,
                establishmentId: this.appService.setEstablishmentId,
                roleId: 5
            };

            console.log('NEW-BODY', newBody);

            this.userService.createFinalUser(newBody)
                .subscribe(
                    response =>{
                        let user = {
                            email: this.newUser.email,
                            password: this.newUser.password
                        };

                        this.authService.login(user)
                            .subscribe(
                                success =>{
                                    this.loading.dismiss();

                                    if(success.data.length > 0){
                                        localStorage.setItem( 'id_token', success.token);

                                        if(success.data.length == 1){
                                            if(success.data[0].establishmentId == this.appService.setEstablishmentId){
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

                                                if(elem.establishmentId == this.appService.setEstablishmentId){
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
    }

    clicCheckbox(){
        console.log('Aceptó los términos y condiciones?',this.aceptTerms);
    }

    showLoading() {
        this.loading = this.loadingCtrl.create({
            content: 'Un momento...',
            enableBackdropDismiss: false
        });
        this.loading.present();
    }
}
