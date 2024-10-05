import { Injectable } from '@angular/core';
import { OrderService } from './orderService';
import {firstValueFrom, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

interface OrderDictionary {
  [commandId: string]: {
    tables: {
      tableNumber: number;
      clients: {
        clientId: string;
        orderId: string;
      }[];
    }[];
  };
}


@Injectable({
  providedIn: 'root',
})export class OrderManagerCopyService {
  constructor(private orderService: OrderService,private http: HttpClient) {}
  private baseUrl = 'http://localhost:3001';

  getTableOrderDetails(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tableOrders/${orderId}`);
  }
  async generateOrderJSON(ordersMap: OrderDictionary): Promise<any[]> {
    const finalOrders: any[] = [];

    const promises = Object.keys(ordersMap).map(async (commandId) => {
      const commandEntry = ordersMap[commandId];

      const tables = await Promise.all(
        commandEntry.tables.map(async (table) => {
          const clientsDetails = await Promise.all(
            table.clients.map(async (client) => {
              try {
                // Utilisation de firstValueFrom à la place de toPromise()
                const tableDetails = await firstValueFrom(this.getTableOrderDetails(client.orderId));

                if (!tableDetails || !tableDetails.lines) {
                  return null;
                }

                const items = tableDetails.lines.map(
                  (line: { item: { _id: any; price: any }; howMany: any }) => ({
                    itemId: line.item._id,
                    quantity: line.howMany,
                    price: line.item.price,
                  })
                );

                return {
                  clientId: client.clientId,
                  clientPaid: false,
                  items: items,
                };
              } catch (error) {
                console.error('Erreur de récupération:', error);
                return null;
              }
            })
          );

          const validClients = clientsDetails.filter(client => client !== null);
          return {
            tableNumber: table.tableNumber,
            tablePaid: false,
            clients: validClients,
          };
        })
      );

      const validTables = tables.filter(table => table !== null);
      finalOrders.push({
        commandId: commandId,
        tables: validTables,
      });
    });

    await Promise.all(promises);


    localStorage.setItem('commands', JSON.stringify(finalOrders));
    return finalOrders;
  }


}
