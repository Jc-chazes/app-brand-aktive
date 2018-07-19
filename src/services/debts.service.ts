import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import 'rxjs/add/operator/map';
import {Debt} from "../models/debts";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable()
export class DebtsService {

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getMembershipsDebts(){
        let userId = this.authService.userId;
        let establishmentId = this.authService.establishmentId;
        let url = this.appService.gateway + '/api/unpaid/'+establishmentId+'/'+userId+'/for-memberships';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Debt[]>(url, httpOptions);
    }

    getProductsAndLessonsDebts(){
        let userId = this.authService.userId;
        let establishmentId = this.authService.establishmentId;
        let url = this.appService.gateway + '/api/unpaid/'+establishmentId+'/'+userId+'/by-user';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Debt[]>(url, httpOptions);
    }

}