import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = 'http://localhost:3001';  // URL du backend

  constructor(private http: HttpClient) {}

  getOrdersByTableNumber(tableNumber: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tableOrders?tableNumber=${tableNumber}`);
  }


  getTableOrderDetails(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tableOrders/${orderId}`);
  }

  detectTablesTaken(orders: any[]): Set<string> {
    const tablesTaken: Set<string> = new Set();

    orders.forEach(order => {
      const orderId = order.orderId;
      if (orderId) {
        const tableId = orderId.substring(3, 6);  // Extraire la partie YYY
        tablesTaken.add(tableId);  // Ajouter le numéro de table à l'ensemble
      }
    });

    return tablesTaken;
  }

  getClientItems(orderId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/tableorder/${orderId}`, {});
  }
}
