import {Component} from '@angular/core';
import {NavController, Loading, LoadingController} from 'ionic-angular';
import {PlansService} from "../../services/plans.service";
import {PlanDetailPage} from "../plan-detail/plan-detail";
import {ProductDetailPage} from "../product-detail/product-detail";
import {FormPersonalDataPage} from "../form-personal-data/form-personal-data";
import {CulqiService} from "../../services/culqi.service";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import { MembershipsService } from '../../services/memberships.service';
import { EstablishmentsService } from '../../services/establishments.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { AuthService } from '../../services/auth.service';

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
        public ga: GoogleAnalytics,
        private memberships: MembershipsService,
        private establishments: EstablishmentsService,
        private alertCtrl: AlertController,
        private authService: AuthService) {

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
        if( this.establishments.currentEstablishment.statusOnsitePaymentMembership ){
            this.alertCtrl.create({
                title: 'Método de pago',
                message: 'Eliga el método de pago para la membresía elegida',
                buttons: [
                    {
                        text: 'Cancelar'
                    },
                    {
                        text: 'Aceptar',
                        handler: (data)=>{
                            switch (data){
                                case 'ONLINE':
                                    this.culqiService.planData = plan;
                                    this.navCtrl.push(FormPersonalDataPage);
                                    break;
                                case 'ONSITE':
                                    this.showOnsitePaymentSelectedAlert(plan);
                                    break;
                            }
                            
                        }
                    }
                ],
                inputs: [
                    {
                        type: 'radio',
                        label: 'Online',
                        value: 'ONLINE',
                        checked: true,
                        name: 'paymentMethod'
                    },                
                    {
                        type: 'radio',
                        label: 'Presencial',
                        value: 'ONSITE',
                        name: 'paymentMethod'
                    }
                ]
            }).present();
        }else{
            this.culqiService.planData = plan;
            this.navCtrl.push(FormPersonalDataPage);
        }
        // this.culqiService.planData = plan;
        // this.navCtrl.push(FormPersonalDataPage);
    }

    showOnsitePaymentSelectedAlert(plan){
        this.alertCtrl.create({
            title: 'Confirmar compra',
            message: `Recuerde acercase a pagar la membresía al establecimieto.
            Solamente podrá reservar 1 clase hasta que no pague completamenete la membresía.`,
            buttons: [
                {
                    text: 'Cancelar'
                },
                {
                    text: 'Confirmar',
                    handler: ()=>{
                        this.obtainMembership(plan);
                    }
                }
            ]
        }).present();
    }

    obtainMembership(plan){
        this.loading = this.loadingCtrl.create({ enableBackdropDismiss: false });
        this.loading.present();
        const establishmentId = this.authService.establishmentId;
        const userId = this.authService.userLogged.id;
        this.memberships.createMembership({
            flagOnsitePayment: 1,
            discount: 0,
            endDate: null,
            establishmentId: establishmentId,
            insUser: userId,
            planId: plan.id,
            realDiscount: 0,
            roleId: null,
            sellerId: userId,
            startDate: plan.startDate || new Date(),
            typeMembership: "0",
            userEstablishmentId: userId
        }).subscribe( result => {
            this.alertCtrl.create({ message: 'Su membresía ha sido adquirida' }).present();
            this.loading.dismiss();
        }, error => {
            console.error('ERROR',error);
            this.loading.dismiss();
        });
    }
}
