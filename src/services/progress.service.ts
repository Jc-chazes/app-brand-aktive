import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Progress} from "../models/progress";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class ProgressService {

    progressDetail : any;

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getPhysicalProgress(){
        let userId = this.authService.userId;
        let url = this.appService.gateway + '/api/physical-conditions/' + userId +'/user';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Progress[]>(url, httpOptions);
    }

}