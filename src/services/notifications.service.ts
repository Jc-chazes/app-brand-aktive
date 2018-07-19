import { Injectable } from '@angular/core';
import { AppService } from "./app.service";
import { AuthService } from "./auth.service";
import { Notification } from "../models/notification";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class NotificationsService {

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private authService: AuthService) { }

    getNotifications(page) {
        let userId = this.authService.userId;
        let url = this.appService.gateway + `/api/notifications/by-user/${userId}?cbp=10&page=${page}&orderby=id&order=desc`;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<Notification[]>(url, httpOptions);
    }
}