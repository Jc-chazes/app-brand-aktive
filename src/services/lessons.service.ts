import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {Lesson} from "../models/lesson";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';
import * as moment from "moment";

@Injectable()
export class LessonsService {

    lessonDetail: any;

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService){}


    getLessons(date: string, establishmentId){
        let url = this.appService.gateway + '/api/lessons/by-establishment/by-lesson-record/'+establishmentId+'?startDate='+date+'&endDate='+date;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Lesson[]>(url, httpOptions);
    }

    getLessonsReserved(date: string){
        let userId = this.authService.userId;
        let dateFormat = moment(date).format("YYYY-MM-DD");

        let url = this.appService.gateway + '/api/lessons/by-establishment/by-lesson_membership/'+userId+'?startDate='+dateFormat+'&endDate='+dateFormat;

        return this.authService.get(url);
    }

    getLessonsByDate(date: string){
        let establishmentId = this.authService.establishmentId;
        let userId = this.authService.userId;
        let url = this.appService.gateway + '/api/lessons/by-establishment/'+establishmentId+'/by-user/'+userId+'?startDate='+date+'&endDate='+date;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        };

        return this.http.get<Lesson[]>(url, httpOptions);
    }

    getUnpaidLessons(){
        let establishmentId = this.authService.establishmentId;
        let userId = this.authService.userId;
        let url = this.appService.gateway + '/api/unpaid/'+ establishmentId +'/'+ userId +'/by-user-all';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Lesson[]>(url, httpOptions);
    }

}