import {Component} from '@angular/core';
import {NavController, Loading, LoadingController} from 'ionic-angular';
import {ReserveDetailPage} from "../reserve-detail/reserve-detail";
import {ReservesService} from "../../services/reserves.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import * as moment from 'moment';

@Component({
    selector: 'page-reserves',
    templateUrl: 'reserves.html'
})
export class ReservesPage {

    loading: Loading;

    reserves: any[];
    thereAreReserves: boolean;

    constructor(
        public navCtrl: NavController,
        private loadingCtrl: LoadingController,
        private reservesService: ReservesService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('reservesPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    ionViewWillEnter(){
        this.getReserves();
    }

    showLoading() {
        this.loading = this.loadingCtrl.create({
            content: 'Un momento...'
        });
        this.loading.present();
    }

    getReserves(){
        this.showLoading();

        this.reservesService.getReserves()
            .subscribe(
                success =>{
                    this.loading.dismiss();
                    let data = success;

                    if(data.length > 0){
                        let arr = [];

                        for(let i of data){
                            let item = {
                                data: i,
                                date: moment(i.startDate).format('DD/MM/YYYY'),
                                hour: moment(i.startDate).format('hh:mm a'),
                                discipline: i.disciplineName,
                            }

                            if(moment(i.startDate, 'YYYY-MM-DD hh:mm:ss').format() >= moment().format()){
                                arr.push(item);
                            }
                        }

                        if(arr.length > 0){
                            arr.sort(
                                (a, b) => {
                                    var aDate = moment(a.date, 'DD/MM/YYYY');
                                    var bDate = moment(b.date, 'DD/MM/YYYY');

                                    if (aDate.isBefore(bDate)) {
                                        return -1;
                                    }

                                    if (aDate.isAfter(bDate)) {
                                        return 1;
                                    }

                                    return 0;
                                }
                            );

                            console.log('RESERVAS', arr);

                            this.reserves = arr;
                            this.thereAreReserves = true;
                        }
                        else{
                            this.thereAreReserves = false;
                        }

                    }
                    else{
                        this.thereAreReserves = false;
                    }
                },
                error =>{
                    this.loading.dismiss();
                    this.thereAreReserves = false;

                }
            )
    }

    viewDetail(reserve){
        this.reservesService.reserveDetail = reserve;
        this.navCtrl.push(ReserveDetailPage);
    }

}