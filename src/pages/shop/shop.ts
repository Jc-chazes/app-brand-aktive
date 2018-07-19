import {Component} from '@angular/core';
import {NavController, Loading, LoadingController} from 'ionic-angular';
import {PlansService} from "../../services/plans.service";
import {PlanDetailPage} from "../plan-detail/plan-detail";
import {ProductDetailPage} from "../product-detail/product-detail";
import {FormPersonalDataPage} from "../form-personal-data/form-personal-data";
import {CulqiService} from "../../services/culqi.service";
import {GoogleAnalytics} from '@ionic-native/google-analytics';

@Component({
    selector: 'page-shop',
    templateUrl: 'shop.html'
})
export class ShopPage {

    loading: Loading;

    selectedList : string = 'memberships';
    plans : any[];
    products : any[];
    thereArePlans : boolean = true;
    thereAreProducts : boolean = true;

    constructor(
        public navCtrl: NavController,
        public loadingCtrl: LoadingController,
        private plansService: PlansService,
        private culqiService: CulqiService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('marketPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));

    }

    ionViewWillEnter(){
        this.getList();
    }

    getList(){
        this.showLoading();
        this.plansService.getOnlinePlans().subscribe(
            data =>{
                this.loading.dismiss();
                if(data.length > 0){
                    let temp = [];

                    for(let i of data){
                        if(i.status == "1"){
                            temp.push(i);
                        }
                    }

                    this.plans = temp;
                    this.thereArePlans = true;
                }
                else{
                    this.thereArePlans = false;
                }
            },
            error =>{
                this.loading.dismiss();
                this.thereArePlans = false;
            }
        );
    }



    showLoading() {
        this.loading = this.loadingCtrl.create({
            enableBackdropDismiss: false
        });
        this.loading.present();
    }

    viewPlanDetail(plan){
        this.plansService.planDetail = plan;
        this.navCtrl.push(PlanDetailPage);
    }

    viewProductDetail(){
        this.navCtrl.push(ProductDetailPage);
    }

    showFormPersonalData(plan){
        this.culqiService.planData = plan;
        this.navCtrl.push(FormPersonalDataPage);
    }

}
