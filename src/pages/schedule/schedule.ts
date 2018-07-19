import {Component} from '@angular/core';
import {NavController, LoadingController, Loading, AlertController, App} from 'ionic-angular';
import {LessonDetailPage} from "../lesson-detail/lesson-detail";
import {ReservesPage} from "../reserves/reserves";
import {LessonsService} from "../../services/lessons.service";
import {ReservesService} from "../../services/reserves.service";
import {DisciplinesService} from "../../services/disciplines.service";
import {PersonalService} from "../../services/personal.service";
import {RoomsService} from "../../services/rooms.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {AuthService} from "../../services/auth.service";
import * as moment from "moment";

@Component({
    selector: 'page-schedule',
    templateUrl: 'schedule.html'
})
export class SchedulePage {

    loading: Loading;

    today = new Date();
    numday = this.today.getDate();
    nummonth = this.today.getMonth();

    week = [
        {number: null, letter: null, month: null, monthNumber: null, date: null},
        {number: null, letter: null, month: null, monthNumber: null, date: null},
        {number: null, letter: null, month: null, monthNumber: null, date: null},
        {number: null, letter: null, month: null, monthNumber: null, date: null},
        {number: null, letter: null, month: null, monthNumber: null, date: null},
        {number: null, letter: null, month: null, monthNumber: null, date: null},
        {number: null, letter: null, month: null, monthNumber: null, date: null}
    ];
    monthName : string;

    contWeek = 0;
    varDate = new Date();

    lessons : any[];
    thereAreLessons : boolean = true;

    divFilter : boolean = false;
    dataToFilter : any[];

    disciplineIdSelected: any = "";
    instructorIdSelected: any = "";
    roomIdSelected: any = "";

    selectDisciplines : any[];
    selectInstructors: any[];
    selectRooms: any[];

    constructor(
        public appCtrl: App,
        public navCtrl: NavController,
        private authService: AuthService,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private lessonsService: LessonsService,
        private reservesService: ReservesService,
        private disciplinesService: DisciplinesService,
        private personalService: PersonalService,
        private roomsService: RoomsService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('schedulePage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));
    }

    /*RENDER CALENDAR AND LESSONS*/

    renderWeek(date){
        let days = ["D","L","M","M","J","V","S"];
        let months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        let offset = -3;

        for(let i = 0; i <= 6; i++){

            let paintDay = moment(date).add(offset, 'days');
            let paintName = paintDay.day();

            this.week[i].date = paintDay.toDate();
            this.week[i].number = paintDay.date();
            this.week[i].letter = days[paintName];
            this.week[i].monthNumber = paintDay.month();
            this.week[i].month = months[paintDay.month()];

            offset++;
        }

        this.monthName = this.week[3].month;

        this.lessons = [];
        this.renderLessons(this.week[3].date);

        return this.week;
    }

    selectedDay(date){
        this.renderWeek(date);
    }

    renderPrevWeek(){
        if (this.contWeek > 0){
            this.varDate.setDate(this.varDate.getDate() - 7);
            this.renderWeek(this.varDate);
            this.contWeek--;
        }
        else if(this.contWeek < 0){
            this.contWeek = 0;
        }
    }

    renderNextWeek(){
        this.varDate.setDate(this.varDate.getDate() + 7);
        this.renderWeek(this.varDate);

        this.contWeek++;
    }

    resetWeek(){
        let today = moment ();
        this.renderWeek(today);
    }

    renderLessons(date){
        this.showLoading();

        let dateFormat = moment(date).format('YYYY-MM-DD');

        this.lessonsService.getLessonsByDate(dateFormat).subscribe(
            data =>{
                if(data.length > 0){
                    this.loading.dismiss();
                    //Si hay clases
                    let temp = [];

                    //Validación para mostrar las clases a partir de esta hora en adelante
                    if(moment(this.week[3].date).format('DD/MM/YYYY') == moment().format('DD/MM/YYYY')){
                        temp = [];
                        for(let item of data){
                            item.date = moment(item.start).format('DD/MM/YYYY');
                            item.start = moment(item.start).format('hh:mm a');
                            item.end = moment(item.end).format('hh:mm a');

                            let currentHour = moment().format();
                            let lessonHour = moment(item.start,'hh:mm a').format();

                            if(lessonHour >= currentHour){
                                temp.push(item);
                            }
                        }

                    }
                    else if(moment(this.week[3].date).format() >= moment().format()){
                        temp = [];
                        for(let item of data){
                            item.date = moment(item.start).format('DD/MM/YYYY');
                            item.start = moment(item.start).format('hh:mm a');
                            item.end = moment(item.end).format('hh:mm a');
                            temp.push(item);
                        }
                    }

                    if(temp.length > 0){
                        temp.sort(
                            (a, b) => {
                                var aDate = moment(a.start, 'hh:mm a');
                                var bDate = moment(b.start, 'hh:mm a');

                                if (aDate.isBefore(bDate)) {
                                    return -1;
                                }

                                if (aDate.isAfter(bDate)) {
                                    return 1;
                                }

                                return 0;
                            }
                        );

                        //Filtrar para mostrar las clases en las que no estoy reservada.
                        let lessonsReserved = temp[0].lessonRecordsBookings ? temp[0].lessonRecordsBookings.split(','):[];
                        let lessonsFiltered = temp.filter((item)=>{
                            return lessonsReserved.indexOf(item.id+'')>-1?false:true;
                        });

                        this.dataToFilter = lessonsFiltered;
                        this.aplyFilter();

                        if(this.lessons.length > 0){
                            this.thereAreLessons = true;
                        }
                        else{
                            this.thereAreLessons = false;
                        }

                    }
                    else{
                        this.thereAreLessons = false;
                    }
                }
                else{
                    this.loading.dismiss();
                    this.thereAreLessons = false;
                }

            },
            error =>{
                this.loading.dismiss();
                this.thereAreLessons = false;

                let alert = this.alertCtrl.create({
                    title: '¡Ups!',
                    subTitle: 'Hubo un problema de conexión',
                    buttons: ['OK']
                });
                alert.present();
            }
        );
    }

    /*VIEW WILL ENTER - VIEW WILL LEAVE*/

    ionViewWillEnter(){
        this.renderWeek(this.today);
        this.getRequirements();
    }

    ionViewWillLeave(){
        this.divFilter = false;
    }

    /*CREATE RESERVE(S)*/

    showSimpleRerserveAlert(lesson){
        let messageAlert = lesson.disciplineName+" a las "+lesson.start+" el "+lesson.date;
        let alert = this.alertCtrl.create({
            title: `<img src="assets/images/booking.png" class="icon-booking">
                    <p class="title-booking">¿QUIERES RESERVAR UN CUPO?</p>`,
            message: messageAlert,
            buttons: [
                {
                    text: 'CONFIRMAR',
                    handler: () => {
                        this.doSimpleReserve(lesson);
                    }
                }
            ]
        });
        alert.present();
    }

    doSimpleReserve(lesson){
        this.showLoading();

        this.reservesService.createReserve(lesson.id)
            .subscribe(
                success =>{
                    this.loading.dismiss();
                    this.successReserve('¡HURRA!','Tu reserva se realizó satisfactoriamente');

                    this.ga.startTrackerWithId('UA-76827860-10')
                        .then(() => {
                            console.log('Google analytics is ready now');
                            this.ga.trackEvent('Reservas', 'crear', this.authService.userLogged.establishmentName+' / '+ this.authService.establishmentId +' / '+lesson.dsciplineName, 1);
                        })
                        .catch(e => console.log('Error starting GoogleAnalytics', e));
                },
                error =>{
                    this.loading.dismiss();

                    let err = error.error;
                    let message = "";

                    switch (err.title) {
                        case "RESERVES.ERROR_MEMBERSHIPS":
                            message = "Uy... no cuentas con una membresía activa para esta disciplina";
                            break;
                        case "RESERVES.ERROR_RESERVES":
                            message = "El cliente ya cuenta con una reserva";
                            break;
                        case "RESERVES.ERROR_CLOSED":
                            message = "La clase se encuentra dictada";
                            break;
                        case "RESERVES.ERROR_OCCUPANCY":
                            message = "Uy... ya no quedan cupos disponibles. Prueba con otra clase por favor";
                            break;
                        case "ERROR_LIMIT_RESERVE":
                            message = "Uy... tu centro no te permite realizar una reserva para esta clase. Por favor contáctate con ellos para que puedan ayudarte.";
                            break;
                        case "RESERVES.ERROR_SESSIONS":
                            message = "Uy... ya consumiste todas las sesiones disponibles de tu membresía. Contáctate con tu centro para que puedas comprar más";
                            break;
                        case "RESERVES.ERROR_SESSION_LESSON":
                            message = "Uy... ya consumiste todas las sesiones disponibles para esta disciplina. Contáctate con tu centro para que puedas comprar más";
                            break;
                        case "RESERVES.ERROR_DATES":
                            message = "Uy... tu membresía ya venció. Contáctate con tu centro para que puedas comprar tu siguiente membresía";
                            break;
                        case "RESERVES.ERROR_DISCIPLINES":
                            message = "Uy... tu membresía no cuenta con esta disciplina. Si deseas poder ingresar acercate a tu centro y compra una membresía con esta disciplina asociada";
                            break;
                        case "ERROR_DB_BODY":
                            message = "Uy... hubo un problema de conexión. Por favor inténtalo nuevamente";
                            break;
                    }

                    let alert = this.alertCtrl.create({
                        title: `<img src="assets/images/sad-face.png" class="icon-booking"> <h6 class="title-booking">`+'No se pudo realizar la reserva'+`</h6>`,
                        subTitle: message,
                        buttons: ['OK']
                    });
                    alert.present();
                }
            );
    }

    successReserve(titleAlert, messageAlert){
        let alert = this.alertCtrl.create({
            title: `<img src="assets/images/success.png"> <h6 class="title-booking">`+titleAlert+`</h6>`,
            message: messageAlert,
            buttons: [
                { text: 'Ok',
                    handler: () => {
                        this.navCtrl.push(ReservesPage);
                    }
                }
            ]
        });
        alert.present();
    }

    /*FILTER, PAGE-RESERVES, PAGE-LESSON-DETAIL, LOADING AND REQUIREMENTS*/

    showFilter(){
        this.divFilter = true;
    }

    aplyFilter(){
        let dataFiltered = [];
        let dataModificada = this.dataToFilter;

        if(this.disciplineIdSelected){
            dataFiltered = [];
            for(let item of dataModificada){
                if( item.disciplineId == this.disciplineIdSelected ){
                    dataFiltered.push(item);
                }
            }
            dataModificada = Object.assign([],dataFiltered);
        }
        if(this.instructorIdSelected){
            dataFiltered = [];
            for(let item of dataModificada){
                if( item.instructorId == this.instructorIdSelected ){
                    dataFiltered.push(item);
                }
            }
            dataModificada = Object.assign([],dataFiltered);
        }
        if(this.roomIdSelected){
            dataFiltered = [];
            for(let item of dataModificada){
                if( item.romId == this.roomIdSelected ){
                    dataFiltered.push(item);
                }
            }

            dataModificada = Object.assign([],dataFiltered);
        }

        this.lessons = Object.assign([], dataModificada);

        this.closeFilter();
    }

    clearFilter(){
        this.disciplineIdSelected = "";
        this.instructorIdSelected = "";
        this.roomIdSelected = "";
        this.aplyFilter();
    }

    closeFilter(){
        this.divFilter = false;
    }

    goToReserves(){
        this.navCtrl.push(ReservesPage);
    }

    viewDetail(lesson){
        this.lessonsService.lessonDetail = lesson;
        this.navCtrl.push(LessonDetailPage);
    }

    showLoading() {
        this.loading = this.loadingCtrl.create({
            enableBackdropDismiss: false
        });
        this.loading.present();
    }

    getRequirements(){
        this.disciplinesService.getDisciplines()
            .subscribe(
                response => {
                    this.selectDisciplines = response;
                }
            );

        this.personalService.getPersonal()
            .subscribe(
                response => {
                    let arr = [];
                    for(let i of response){
                        if(i.roleId == 4){
                            arr.push(i);
                        }
                    }
                    this.selectInstructors = arr;
                }
            );

        this.roomsService.getRooms()
            .subscribe(
                response => {
                    this.selectRooms = response;
                }
            );
    }
}
