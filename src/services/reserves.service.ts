import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Booking} from "../models/booking";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';
import * as moment from 'moment';

@Injectable()
export class ReservesService {

    reserveDetail : any;

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}


    createReserve(lessonId){
        let userId = this.authService.userId;
        let data = {
            status: 1,
            userId: userId,
            insUser: userId,
        };

        let url = this.appService.gateway + '/api/lessons/'+lessonId+'/membership-lesson';

        return this.authService.post(url, data);
    }

    createMultipleReserves(data, lessonId){
        let userId = this.authService.userId;

        data.userEstablishment = userId;

        let url = this.appService.gateway + '/api/lessons/'+lessonId+'/membership-lesson/recurrent';
        return this.authService.post(url, data);
    }

    deleteReserve(lessonRecordId,reserveId) {
        let url = this.appService.gateway + '/api/lessons/' + lessonRecordId + '/membership-lesson/'+reserveId;

        return this.authService.delete(url);
    }

    getReserves(){
        let userId = this.authService.userId;
        let dateHour = moment().format('YYYY-MM-DD hh:mm');

        let url = this.appService.gateway + '/api/user-establishment/'+userId+'/reserves?date='+dateHour;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Booking[]>(url, httpOptions);
    }



}