import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {NotificationsService} from '../../services/notifications.service';
import {CommunicationsService} from '../../services/communications.service';
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import * as moment from "moment";

@Component({
    selector: 'page-communications',
    templateUrl: 'communications.html'
})
export class CommunicationsPage {

    segment = 'news';
    thereAreNotifications: boolean;
    listNotifications = [];
    posInitial = 1;
    statusShowNews: boolean = false;
    listNews: any[] = [];

    constructor(public navCtrl: NavController,
                private notificationsService: NotificationsService,
                private communicationsService: CommunicationsService,
                public ga: GoogleAnalytics) {

        moment.locale('es', {
            relativeTime: {
                future: 'en %s',
                past: 'Hace %s ',
                s:  'unos segundos',
                ss: '%sS',
                m:  'un minuto',
                mm: '%d Minutos',
                h:  'una hora',
                hh: '%d Horas',
                d:  'un día',
                dd: '%d días',
                M:  'Un Mes',
                MM: '%d meses',
                y:  'un Año',
                yy: '%d años'
            }
        });
        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('notificationsPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    public orderByNewPosition(news) {
        return news.sort((a, b) => a.position - b.position );
    }

    public getNewsByEstablishment() {
        this.listNews = [];
        this.communicationsService.getNewsByEstablishment()
            .subscribe(
                (success: any) => {
                    if (success.length > 0) {
                        this.listNews = this.orderByNewPosition(success);
                    }
                }, error => {
                    console.log('ERROR', error);
                }
            );
    }

    public ionViewWillEnter() {
        this.statusShowNews = localStorage.getItem('statusShowNews') == 'Y';
        this.getNotifications();
        this.getNewsByEstablishment();
    }

    public getNotifications(infiniteScroll?) {
        this.notificationsService.getNotifications(this.posInitial)
            .subscribe(
                success => {
                    if (success.length != 0) {
                        this.posInitial++;
                        this.thereAreNotifications = true;
                        if(this.posInitial <= 1){
                            this.listNotifications = [];
                        }
                        for (let notify of success) {
                            notify.timeAgo = moment(notify.insDate).fromNow();
                            this.listNotifications.push(notify);
                        }
                        if (infiniteScroll) {
                            infiniteScroll.complete();
                            console.log(this.listNotifications);
                        }
                    }
                    else {
                        if (this.listNotifications.length < 1) {
                            this.thereAreNotifications = false;
                        } else {
                            this.thereAreNotifications = true;
                        }
                        if (infiniteScroll) {
                            infiniteScroll.complete();
                        }
                    }
                },
                error => {
                    console.error(JSON.stringify(error));
                }
            );
    }

}
