import {Component} from '@angular/core';
import {NavController, Loading, LoadingController} from 'ionic-angular';
import {MembershipsPage} from "../memberships/memberships";
import {ReservesPage} from "../reserves/reserves";
import {ProductsPage} from "../products/products";
import {UnpaidsPage} from "../unpaids/unpaids";
import {DebtsPage} from "../debts/debts";
import {SettingsPage} from "../settings/settings";
import {ProfilePage} from "../profile/profile";
import {UserService} from "../../services/user.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {QrCodePage} from "../qr-code/qr-code";
@Component({
    selector: 'page-managment',
    templateUrl: 'managment.html'
})
export class ManagmentPage {

    user : any;
    loading: Loading;

    constructor(
        public ga: GoogleAnalytics,
        public navCtrl: NavController,
        private loadingCtrl: LoadingController,
        private userService: UserService) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('managmentPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    getDataUser(){
        this.showLoading();
        this.userService.getUser()
            .subscribe(
                success =>{
                    this.loading.dismiss();
                    this.user = success[0];

                    //SET PHOTO
                    if (this.user.photo === null || this.user.photo === "") {
                        this.user.photo = "assets/images/user.png";
                    }
                    else {
                        this.user.photo = 'http://lumen.fitcoapp.net' + this.user.photo + '?r='+ Math.random();
                    }
                },
                error =>{
                    this.loading.dismiss();
                    console.log('ERROR', error);
                }
            );
    }

    ionViewWillEnter(){
        this.getDataUser();
    }

    viewSettings(){
        this.navCtrl.push(SettingsPage);
    }

    viewProfile(){
        this.navCtrl.push(ProfilePage);
    }

    goToMemberships(){
        this.navCtrl.push(MembershipsPage);
    }

    goToReserves(){
        this.navCtrl.push(ReservesPage);
    }

    goToProducts(){
        this.navCtrl.push(ProductsPage);
    }

    goToUnpaids(){
        this.navCtrl.push(UnpaidsPage);
    }

    goToDebts(){
        this.navCtrl.push(DebtsPage);
    }

    goToQrCode(){
      this.navCtrl.push(QrCodePage);
    }
    showLoading() {
        this.loading = this.loadingCtrl.create({
            content: 'Un momento...',
            enableBackdropDismiss: false
        });
        this.loading.present();
    }
}
