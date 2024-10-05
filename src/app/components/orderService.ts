
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, concatMap, from, Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import {OrderDictionary} from "./table-reservation/table-reservation.component";
import {Item} from "../interfaces/Item";
import {ItemBack} from "../interfaces/ItemBack";
import {addItemForClient} from "../stores/command.action";
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = 'http://localhost:3001';  // URL du backend
  public globalOrderPrefix:BehaviorSubject<string>=new BehaviorSubject("");

  constructor(private http: HttpClient) {}

  getOrdersByTableNumber(tableNumber: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tableOrders?tableNumber=${tableNumber}`);
  }


  getTableOrderDetails(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tableOrders/${orderId}`);
  }
  getTableOrder(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tableOrders`);
  }
  detectTablesTaken(orders: any[]): Set<string> {
    const tablesTaken: Set<string> = new Set();

    orders.forEach(order => {
      const orderId = order.orderId;
      if (orderId) {
        const tableId = orderId.substring(3, 6);
        tablesTaken.add(tableId);
      }
    });

    return tablesTaken;
  }

  getClientItems(orderId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/tableorder/${orderId}`, {});
  }

  filterAndOrganizeOrders(globalOrderPrefix: string): Observable<OrderDictionary> {
    if(globalOrderPrefix==="")
    {
      globalOrderPrefix=this.globalOrderPrefix.value;
    }
    console.log("fillll");
    return this.getTableOrder().pipe(
      map((orders) => {
        const filteredOrders = orders.filter((order: { tableNumber: { toString: () => string; }; }) => order.tableNumber.toString().startsWith(globalOrderPrefix) && order.tableNumber.toString().length > 3);

        // Dictionnaire pour stocker les tables et les clients associés
        const ordersMap: { [key: string]: any } = {};

        // Parcourir chaque commande filtrée
        filteredOrders.forEach((order: { tableNumber: { toString: () => any; }; _id: any; billed: any;}) => {
          const tableNumberFull = order.tableNumber.toString(); // ex: "300001001"

          const tableNumber = parseInt(tableNumberFull.slice(3, 6));  // Extraire YYY (numéro de la table)
          const clientNumber = parseInt(tableNumberFull.slice(6));  // Extraire ZZZ (numéro du client)

          // Vérifier si la table existe déjà dans le dictionnaire
          if (!ordersMap[tableNumber]) {
            ordersMap[tableNumber] = {
              tableNumber: tableNumber,
              clients: []
            };
          }

          // Ajouter le client à la table
          ordersMap[tableNumber].clients.push({
            clientId: clientNumber,
            orderId: order._id,  // Utiliser l'_id de la commande comme OrderId
            clientPaid: order.billed ==null? false : true
          });
        });

        console.log('Mapped Orders:', ordersMap);

        return ordersMap ;
      })
    );
  }
  handleMappedOrders(ordersMap: { [key: string]: any }) {
    // Afficher les commandes mappées dans la console
    console.log('Traitement des commandes mappées:', ordersMap);


    Object.keys(ordersMap).forEach(tableNumber => {
      const tableData = ordersMap[tableNumber];
      console.log(`Table numéro ${tableNumber}:`);

      tableData.clients.forEach((client: any) => {
        console.log(`  Client ID: ${client.clientId}, Order ID: ${client.orderId}`);
      });
    });


    localStorage.setItem('MappedOrders', JSON.stringify(ordersMap));
    console.log('Les commandes mappées ont été stockées dans le localStorage.');

  }
  public addItemForClient(orderId:string,item:Item):Observable<any>{
    const payloadForBack:ItemBack={
      menuItemId:item.itemId,
      menuItemShortName:item.shortName,
      howMany:item.quantity
    }
    return this.http.post(`${this.baseUrl}/tableOrders/${orderId}`, payloadForBack);
  }
  addItemsForClient(orderId:string,items:Item[]):Observable<any>{
    console.log("ici",orderId,items)
    return from(items).pipe(
      concatMap(item=>
        this.addItemForClient(orderId,item)
      )
    );

  }



}
