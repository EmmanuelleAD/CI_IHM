import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {OrderManagerCopyService} from "./order-manager-copy.service";
interface OrderDictionary {
  [commandId: string]: {
    tables: {
      tableNumber: number;  // Le vrai numéro de la table (YYY)
      clients: {            // Liste des clients associés à cette table
        clientId: string;   // Le numéro du client (ZZZ)
        orderId: string;    // L'ID de la commande (récupéré depuis la réponse backend)
      }[];
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = 'http://localhost:3001';  // URL du backend

  constructor(private http: HttpClient, private orderCopy:OrderManagerCopyService) {}

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
  filterAndOrganizeOrders(globalOrderPrefix: string) {
    console.log(globalOrderPrefix);
    this.getTableOrder().subscribe({
      next: (orders) => {
        // Filtrer les commandes dont le tableNumber a la structure complète '300XXXYYY'
        const filteredOrders = orders.filter((order: { tableNumber: { toString: () => string; }; }) => {
          const tableNumberFull = order.tableNumber.toString();
          // Vérifier que le numéro de la table commence par le préfixe global et a une longueur suffisante pour être '300XXXYYY'
          return tableNumberFull.startsWith(globalOrderPrefix) && tableNumberFull.length === 9;
        });

        // Dictionnaire pour stocker les tables et les clients associés
        const ordersMap: OrderDictionary = {};  // Utilisation de l'interface OrderDictionary

        // Parcourir chaque commande filtrée
        filteredOrders.forEach((order: { tableNumber: { toString: () => any; }; _id: any; }) => {
          const tableNumberFull = order.tableNumber.toString();  // ex: "300001001"

          const tableNumber = parseInt(tableNumberFull.slice(3, 6));  // Extraire YYY (numéro de la table)
          const clientNumber = parseInt(tableNumberFull.slice(6));    // Extraire ZZZ (numéro du client)

          const commandId = globalOrderPrefix;  // Utiliser le préfixe global comme commandId

          // Si le commandId n'existe pas encore dans ordersMap, on l'ajoute
          if (!ordersMap[commandId]) {
            ordersMap[commandId] = {
              tables: []
            };
          }

          // Rechercher la table dans la commande actuelle
          let table = ordersMap[commandId].tables.find(t => t.tableNumber === tableNumber);

          // Si la table n'existe pas encore, on l'ajoute
          if (!table) {
            table = {
              tableNumber: tableNumber,
              clients: []
            };
            ordersMap[commandId].tables.push(table);
          }

          // Ajouter le client à la table
          table.clients.push({
            clientId: clientNumber.toString(),  // Utilisation de clientId sous forme de chaîne
            orderId: order._id  // Utiliser l'_id de la commande comme OrderId
          });
        });

        console.log('Mapped Orders:', ordersMap);
        this.orderCopy.generateOrderJSON(ordersMap);
        // Appeler une méthode pour gérer cette structure (par ex. : affichage, envoi au serveur, etc.)
        this.handleMappedOrders(ordersMap);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des commandes', err);
      }
    });
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



}
