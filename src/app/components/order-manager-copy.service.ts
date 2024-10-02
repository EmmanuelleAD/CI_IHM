import { Injectable } from '@angular/core';
import {OrderService} from "./orderService";


interface OrderDictionary {
  [commandId: string]: {
    tableId: string;
    tableNumber: number;
    clients: {
      clientId: string;
      orderId: string;
    }[];
  };
}
@Injectable({
  providedIn: 'root'
})
export class OrderManagerCopyService {

  constructor(private orderService: OrderService) {}

  generateOrderJSON(ordersMap: OrderDictionary): Promise<any[]> {
    const finalOrders: any[] = [];

    const promises = Object.keys(ordersMap).map(async (commandId) => {
      const commandEntry = ordersMap[commandId];

      const tables = await Promise.all(
        commandEntry.clients.map(async (client) => {
          const tableDetails = await this.orderService
            .getTableOrderDetails(client.orderId)
            .toPromise();

          const items = tableDetails.lines.map(
            (line: { item: { _id: any; price: any }; howMany: any }) => ({
              itemId: line.item._id,
              quantity: line.howMany,
              price: line.item.price,
            })
          );


          return {
            table: commandEntry.tableId,
            tablePaid: false,
            tableNumber: commandEntry.tableNumber,
            clients: [
              {
                client: client.clientId,
                clientPaid: false,
                items: items,
              },
            ],
          };
        })
      );

      finalOrders.push({
        commandId: commandId,
        tables: tables,
      });
    });

    return Promise.all(promises).then(() => {
      this.downloadJsonFile(finalOrders);
      return finalOrders;
    });
  }


  downloadJsonFile(jsonData: any) {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "test.json";
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
