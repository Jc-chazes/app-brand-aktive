import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";
import {User} from "../models/user";
import {Photo} from "../models/photo";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class UserService {

    userDataToCreate: any;
    photoUser: any;

    constructor(
        private http : HttpClient,
        private appService: AppService,
        private authService: AuthService){}

    getUser(){
        let userId = this.authService.userId;
        let url = this.appService.gateway + '/api/user-establishment/' + userId;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        }

        return this.http.get<User>(url,httpOptions);
    }

    updateUser(user){
        let url = this.appService.gateway + '/api/user-establishment/' + user.id;

        return this.authService.put(url,user);
    }

    updatePhoto(photob64){
        let base64Image = photob64;
        let userId = this.authService.userId;

        let url = 'https://lumen.fitcoapp.net/users/image/upload';
        let headers = new HttpHeaders({'Content-Type': 'application/json'});

        let data = {
            img: base64Image,
            userId: userId
        };

        return this.http.post<Photo>(url, data, {headers:headers});
    }

    changePassword(data){
        let userId = this.authService.userId;
        let url = this.appService.gateway + '/api/users/'+userId+'/update-password';

        return this.authService.post(url,data);
    }

    createUser(data){
        let url = this.appService.gateway + '/api/users';

        return this.authService.post(url,data);
    }

    createUserEstablishment(data){
        let url = this.appService.gateway + '/api/user-establishment/';

        return this.authService.post(url,data);
    }

    createFinalUser(data){
        let url = this.appService.gateway + '/auth/add-user-stablishment';

        return this.http.post(url,data);
    }

}