import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Plan} from "../models/plan";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class PlansService {

    planDetail : any;

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}


    getOnlinePlans(){
        console.log('SERVICE');
        let establishmentId = this.authService.establishmentId;
        let url = this.appService.gateway + '/api/plans/'+establishmentId+'/by-establishment?cbp=all&typePlan=2';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Plan[]>(url, httpOptions);
    }

}