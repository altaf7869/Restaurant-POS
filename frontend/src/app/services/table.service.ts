import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API =  environment.apiUrl + '/tables';

@Injectable({ providedIn: 'root' })
export class TableService {
  constructor(private http: HttpClient) {}

  getTables(): Observable<any[]> {
    return this.http.get<any[]>(API);
  }
}
