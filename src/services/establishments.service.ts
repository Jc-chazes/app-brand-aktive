import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Establishment} from "../models/establishment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class EstablishmentsService {

    establishmentsByUser : any;
    selectedEstablishmentId : any;
    establishmentsKeys : any = {
        keyPublic : "",
        keyPrivate : "",
    };

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getAllEstablishments(){
        let url = this.appService.gateway + '/api/establishment';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Establishment[]>(url, httpOptions);
    }

    getEstablishmentById(){
        let url = this.appService.gateway + '/api/establishment/'+ this.authService.establishmentId;

        return this.authService.get(url);
    }


}