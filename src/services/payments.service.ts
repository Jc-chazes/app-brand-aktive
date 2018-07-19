import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Payment} from "../models/payment";
import 'rxjs/add/operator/map';

@Injectable()
export class PaymentsService {

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getPaymentsByMembership(membershipId){
        let url = this.appService.gateway + '/api/memberships/'+membershipId+'/payments';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Payment[]>(url, httpOptions);
    }

    createPayment(payment){
        let url = this.appService.gateway + '/api/payments';

        return this.authService.post(url, payment);
    }
}