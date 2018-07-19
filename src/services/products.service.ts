import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Product} from "../models/product";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class ProductsService {

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getProductsByUser(){
        let userId = this.authService.userId;
        let url = this.appService.gateway + '/api/stock/'+userId+'/by-user?cbp=all';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Product[]>(url,httpOptions);
    }

}