import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Discipline} from "../models/discipline";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class DisciplinesService {

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getDisciplines(){
        let establishmentId = this.authService.establishmentId;
        let url = this.appService.gateway + '/api/disciplines/' +establishmentId+ '/by-establishment?cbp=ALL';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Discipline[]>(url, httpOptions);
    }

    getDisciplinesByMembership(membershipId){
        let url = this.appService.gateway + '/api/disciplines/'+membershipId+'/by-plans';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Discipline[]>(url, httpOptions);
    }

}