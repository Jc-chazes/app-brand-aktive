export class Establishment{
    id: number;
    name: string;
    statusApp: any;

    get statusOnsitePaymentMembership(): boolean{
        return localStorage.getItem('statusOnsitePaymentMembership') == 'Y';
    }
}