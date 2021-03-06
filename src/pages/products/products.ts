import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ProductsService} from "../../services/products.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import * as moment from 'moment';

@Component({
    selector: 'page-products',
    templateUrl: 'products.html'
})
export class ProductsPage {

    products : any;
    thereAreProducts : boolean;

    constructor(
        public navCtrl: NavController,
        private productsService: ProductsService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('productsPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    ionViewWillEnter(){
        this.getProducts();
    }

    getProducts(){
        this.productsService.getProductsByUser()
            .subscribe(
                success =>{
                    let data = success;

                    if(data.length > 0){
                        let arr = [];
                        for(let i of data){
                            i.date = moment(i.date).format('DD/MM/YYYY');
                            arr.push(i);
                        }

                        this.products = arr;
                        this.thereAreProducts = true;
                    }
                    else{
                        this.thereAreProducts = false;
                    }
                },
                error =>{
                    console.log('error', error);
                    this.thereAreProducts = false;
                }
            )
    }

}
