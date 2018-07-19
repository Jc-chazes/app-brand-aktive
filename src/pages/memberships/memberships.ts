import {Component} from '@angular/core';
import {NavController, Loading, LoadingController} from 'ionic-angular';
import {MembershipDetailPage} from "../membership-detail/membership-detail";
import {MembershipsService} from "../../services/memberships.service";
import {DisciplinesService} from "../../services/disciplines.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import * as moment from 'moment';

@Component({
    selector: 'page-memberships',
    templateUrl: 'memberships.html'
})
export class MembershipsPage {

    loading: Loading;

    memberships : any[];
    thereAreMemberships : boolean;

    constructor(
        public navCtrl: NavController,
        public loadingCtrl: LoadingController,
        private membershipsService: MembershipsService,
        private disciplinesService: DisciplinesService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('membershipsPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));

    }

    setDataMemberships(data){
        this.memberships = [];

        for(let item of data){

            console.log('ITEM',item);

            let memb = {
                id: item.id,
                status: item.status,
                planName: item.planName,
                startDate: moment(item.startDate, ["DD-MM-YYYY"]).format("DD/MM/YYYY"),
                endDate: moment(item.endDate,["DD-MM-YYYY"]).format("DD/MM/YYYY"),
                disciplines: "",
                useSessions: item.sessions,
                totalSessions: item.totalSessions,
                establishment: item.establishmentsName,
                useFreeze : item.useFreeze,
                totalFreeze : item.totalFreeze,
                planPrice: item.plansPrice,
                debt: item.unpaid,
            }

            this.disciplinesService.getDisciplinesByMembership(item.planId)
                .subscribe(success =>{
                    for (let i of success){
                        memb.disciplines += i.name += ", ";
                    }

                    memb.disciplines = memb.disciplines.substr(0, memb.disciplines.length - 2);
                });

            this.memberships.push(memb);

            this.memberships.sort(
                (a, b) => {
                    var aDate = moment(a.start_date, 'DD-MM-YYYY');
                    var bDate = moment(b.start_date, 'DD-MM-YYYY');

                    if (aDate.isBefore(bDate)) {
                        return 1;
                    }

                    if (aDate.isAfter(bDate)) {
                        return -1;
                    }
                }
            );

            console.log('MEMB', this.memberships);
        }
    }

    ionViewWillEnter(){
        this.showLoading();

        this.membershipsService.getMemberships()
            .subscribe(
                success =>{
                    this.loading.dismiss();
                    let data = success;
                    if(data.length > 0){
                        this.setDataMemberships(data);
                        this.thereAreMemberships = true;
                    }
                    else{
                        this.thereAreMemberships = false;
                    }
                },
                error  =>{
                    console.log('ERROR', error);
                    this.loading.dismiss();
                    this.thereAreMemberships = false;
                }
            );
    }

    showLoading() {
        this.loading = this.loadingCtrl.create({
            enableBackdropDismiss: false
        });
        this.loading.present();
    }

    viewDetail(membership){
        this.membershipsService.membershipDetail = membership;
        this.navCtrl.push(MembershipDetailPage);
    }

}
