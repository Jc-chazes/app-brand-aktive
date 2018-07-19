import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ProgressService} from "../../services/progress.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

@Component({
    selector: 'page-progress-detail',
    templateUrl: 'progress-detail.html'
})
export class ProgressDetailPage {

    report : any;

    constructor(
        public navCtrl: NavController,
        private progressService : ProgressService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('progressDetailPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    ionViewWillEnter(){
        this.report = this.progressService.progressDetail;
        console.log('REPORTE', this.report);
    }

}
