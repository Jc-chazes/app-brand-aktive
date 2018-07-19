import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Personal} from "../models/personal";
import {HttpClient,HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class PersonalService {

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getPersonal(){
        let establishmentId = this.authService.establishmentId;
        let url = this.appService.gateway + '/api/user-establishment/'+establishmentId+'/by-establishment?cbp=all&orderby=insDate&typeuser=1';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Personal[]>(url, httpOptions);
    }

}