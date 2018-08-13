import {Component, ViewChild} from '@angular/core';
import { Tabs, Events } from 'ionic-angular';
import {SchedulePage} from "../schedule/schedule";
import {ShopPage} from "../shop/shop";
import {HomePage} from '../home/home';
import {CommunicationsPage} from "../communications/communications";
import {ManagmentPage} from "../managment/managment";
// para el manejo de las notificaciones
declare var Pusher: any;
import {LocalNotifications} from '@ionic-native/local-notifications';
import {AuthService} from "./../../services/auth.service";
import {NavController} from 'ionic-angular';

@Component({
    templateUrl: 'tabs.html'
})
export class TabsPage {

    tab1Root = SchedulePage;
    tab2Root = ShopPage;
    tab3Root = HomePage;
    tab4Root = CommunicationsPage;
    tab5Root = ManagmentPage;
    pusher: any;
    cont = 0;
    urlNotification = "";
    notificationCount = 0;

    @ViewChild("nametab") nametab: Tabs;

    constructor(private localNotifications: LocalNotifications,
                public navCtrl: NavController,
                public events: Events,
                private authService: AuthService) {

        this.notificationCount = localStorage.getItem('countNotification') == null ? 0 : parseInt(localStorage.getItem('countNotification'));
        this.notificationManager();
    }

    ionViewDidLoad(){
        this.events.subscribe('gototab', () => {
            console.log('CHAU');
            this.nametab.select(2);
        })
    }


    notificationManager() {
        this.pusher = new Pusher('dbbd540cdd39aa8f015c', {
            cluster: 'us2',
            encrypted: true
        });
        let establishmentChanel = this.pusher.subscribe('establishment-' + this.authService.establishmentId);
        establishmentChanel.bind('notification', (dataIn) => {
            this.localNotifications.cancelAll().then(() => {
                this.localNotifications.schedule({
                    id: this.cont,
                    title: dataIn.title,
                    text: dataIn.text
                });
                this.cont = this.cont++;
            });
        });


        let userChanel = this.pusher.subscribe('user-' + this.authService.userId);
        userChanel.bind('notification', (dataIn) => {
            localStorage.setItem("countNotification", `${this.notificationCount + 1}`);
            this.notificationCount++;
            this.localNotifications.cancelAll().then(() => {
                this.localNotifications.schedule({
                    id: this.cont,
                    title: dataIn.title,
                    text: dataIn.text
                });
                this.cont = this.cont++;
            });
        });
    }

    cleanNotifications() {
        this.notificationCount = 0;
        localStorage.setItem("countNotification", `0`)
    }


}
