import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Membership} from "../models/membership";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class MembershipsService {

    membershipDetail : any;

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getMemberships(){
        let userId = this.authService.userId;
        let url = this.appService.gateway + '/api/memberships/' +userId+ '/by-user?orderby=id&status=ALL';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Membership[]>(url, httpOptions);
    }

    createMembership(membership){
        let url = this.appService.gateway + '/api/memberships';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.post<Membership>(url, membership, httpOptions);
    }

}