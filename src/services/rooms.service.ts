import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Room} from "../models/room";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class RoomsService {

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getRooms(){
        let establishmentId = this.authService.establishmentId;
        let url = this.appService.gateway + '/api/rooms/'+establishmentId+'/by-establishment?cbp=ALL';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Room[]>(url, httpOptions);
    }

}