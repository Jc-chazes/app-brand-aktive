import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {Freeze} from "../models/freeze";
import 'rxjs/add/operator/map';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable()
export class FreezesService {

    constructor(
        private http: HttpClient,
        private appService: AppService){}

    getFreezesByMembership(membershipId){
        let url = this.appService.gateway + '/api/memberships/'+membershipId+'/freezes';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Freeze[]>(url, httpOptions);
    }

}