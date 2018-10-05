import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Establishment} from "../models/establishment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class EstablishmentsService {

    establishmentsByUser : any;
    selectedEstablishmentId : any;
    establishmentsKeys : any = {
        keyPublic : "",
        keyPrivate : "",
    };
    private currentEstablishmentSubject = new BehaviorSubject<Establishment>( new Establishment() );
    public currentEstablishmentRx = this.currentEstablishmentSubject.asObservable();
    public get currentEstablishment(): Establishment{
      return this.currentEstablishmentSubject.value;
    }

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