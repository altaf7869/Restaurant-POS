import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Payment {
  Id: number;
  OrderId: string;
  Amount: number;
  Method: string;
  CollectedBy: string;
  CollectedByName: string;
  CollectedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {


      private readonly apiUrl = `${environment.apiUrl}/payments`;
    
//   private apiUrl = 'http://localhost:3000/api/payments';

  constructor(private http: HttpClient, private auth: AuthService) {}


  private getHeaders() {
    const token = this.auth.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  
  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl, this.getHeaders());
  }
}
