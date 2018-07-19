import {Injectable} from '@angular/core';
import {AppService} from "./app.service";
import {Attendance} from "../models/attendance";
import 'rxjs/add/operator/map';
import {HttpClient} from "@angular/common/http";

@Injectable()
export class AttendancesService {

    constructor(
        private http: HttpClient,
        private appService: AppService){}

    getAttendancesByMembership(membershipId){
        let url = this.appService.gateway + '/api/memberships/'+membershipId+'/lessons';
        return this.http.get<Attendance[]>(url);
    }

}