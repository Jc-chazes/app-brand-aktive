import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {PlansService} from "../../services/plans.service";
import {FormPersonalDataPage} from "../form-personal-data/form-personal-data";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

@Component({
    selector: 'page-plan-detail',
    templateUrl: 'plan-detail.html'
})
export class PlanDetailPage {

    plan : any;

    constructor(
        public navCtrl: NavController,
        private plansService: PlansService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('planDetailPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    ionViewWillEnter(){
        this.plan = this.plansService.planDetail;
        console.log('PLAN', this.plan);
    }

    showFormPersonalData(){
        console.log('HOLAS');
        this.navCtrl.push(FormPersonalDataPage);
    }

}
