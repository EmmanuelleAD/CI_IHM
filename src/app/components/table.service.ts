import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TableBack} from "../interfaces/TableBack";

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private baseUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) { }

  createTable(number: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/tables`, { number });
  }

  createTableOrder(tableNumber: number, customersCount: number): Observable<any> {
    const payload :TableBack ={ tableNumber:tableNumber, customersCount:customersCount };
    return this.http.post(`${this.baseUrl}/tableOrders`, payload);
  }

  getAllTables(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tables`);
  }
}
