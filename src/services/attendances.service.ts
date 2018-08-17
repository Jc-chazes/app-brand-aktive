import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {AuthService} from "./auth.service";

@Injectable()
export class AttendancesService {

    constructor(
        private authService: AuthService,
        private appService: AppService){}

    getAttendancesByMembership(membershipId){
        let url = this.appService.gateway + '/api/memberships/'+membershipId+'/lessons';
        return this.authService.get(url);
    }

}