import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";

@Injectable()
export class CommunicationsService {

    constructor(private appService: AppService,
                private authService: AuthService){}

    public getNewsByEstablishment() {
        const establishmentId = this.authService.establishmentId;
        const urlNewsByEstablishment = `${this.appService.gateway}/api/communications/get-news/${establishmentId}`;
        return this.authService.get(urlNewsByEstablishment);
    }

}