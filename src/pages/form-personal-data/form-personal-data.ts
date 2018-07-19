import {Component} from '@angular/core';
import {NavController, AlertController} from 'ionic-angular';
import {FormCardDataPage} from "../form-card-data/form-card-data";
import {UserService} from "../../services/user.service";
import {CulqiService} from "../../services/culqi.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

@Component({
    selector: 'page-form-personal-data',
    templateUrl: 'form-personal-data.html'
})
export class FormPersonalDataPage {

    user: any = {
        name : "",
        lastName : "",
        email : "",
        celPhone : "",
        address : "",
        city: ""
    };

    constructor(
        public navCtrl: NavController,
        public alertCtrl: AlertController,
        private userService: UserService,
        private culqiService: CulqiService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('formPersonalDataPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));

    }

    ionViewWillEnter(){
        this.showCulqiForm();
    }

    showCulqiForm(){
        this.userService.getUser()
            .subscribe(
                success =>{
                    let data = success[0];
                    this.user.name = data.name;
                    this.user.lastName = data.lastName;
                    this.user.email = data.email;
                    this.user.celPhone = data.celPhone;
                    this.user.address = data.address;
                },
                error =>{
                    console.log('ERROR', error);
                }
            );
    }

    showFormCardData(){
        if(this.user.name == "" || this.user.lastName == "",
           this.user.email == "" || this.user.celPhone == "",
           this.user.address == "" || this.user.city == ""){

            let alert = this.alertCtrl.create({
                title: 'Ups...',
                message: 'Por favor completa todos los campos',
                buttons: ['Ok']
            });
            alert.present();
        }
        else{
            this.culqiService.userData = this.user;
            this.navCtrl.push(FormCardDataPage);
        }
    }

}
