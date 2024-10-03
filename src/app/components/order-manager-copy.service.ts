import { Injectable } from '@angular/core';
import { OrderService } from './orderService';

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
  constructor(private orderService: OrderService) {}

  async generateOrderJSON(ordersMap: OrderDictionary): Promise<any[]> {
    console.log("Entrée dans generateOrderJSON avec ordersMap :", ordersMap);
    const finalOrders: any[] = [];

    const promises = Object.keys(ordersMap).map(async (commandId) => {
      const commandEntry = ordersMap[commandId];

      console.log(`Traitement des tables pour la commande ${commandId}`, commandEntry.tables);

      const tables = await Promise.all(
        commandEntry.tables.map(async (table) => {
          try {
            console.log(`Traitement des clients pour la table ${table.tableNumber}`, table.clients);

            // Traitement de chaque client pour récupérer les détails des commandes
            const clientsDetails = await Promise.all(
              table.clients.map(async (client) => {
                try {
                  console.log(`Récupération des détails de la commande pour le client ${client.clientId} avec orderId ${client.orderId}`);

                  const tableDetails = await this.orderService.getTableOrderDetails(client.orderId).toPromise();

                  // Vérifiez si `tableDetails` est nul ou invalide
                  if (!tableDetails || !tableDetails.lines) {
                    console.error(`Détails de commande non valides pour le client ${client.clientId}`, tableDetails);
                    return null;
                  }

                  console.log(`Détails récupérés pour le client ${client.clientId}`, tableDetails);

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
                  console.error(`Erreur lors de la récupération des détails de la commande pour le client ${client.clientId}`, error);
                  return null;  // Retourne null si une erreur est rencontrée
                }
              })
            );

            // Filtrer les clients null (ceux pour lesquels la récupération a échoué)
            const validClients = clientsDetails.filter(client => client !== null);
            console.log(`Détails des clients récupérés pour la table ${table.tableNumber}`, validClients);

            // Retourner la table avec les détails des clients valides
            return {
              tableNumber: table.tableNumber,
              tablePaid: false,
              clients: validClients,
            };
          } catch (error) {
            console.error(`Erreur lors du traitement des clients pour la table ${table.tableNumber}`, error);
            return null;  // Retourne null si une erreur est rencontrée
          }
        })
      );

// Filtrer les tables null (celles pour lesquelles le traitement a échoué)
      const validTables = tables.filter(table => table !== null);
      console.log(`Tables récupérées pour la commande ${commandId}:`, validTables);
      console.log(`Tables récupérées pour la commande ${commandId}:`, tables);

      // Ajout de la commande complète à la liste finale des commandes
      finalOrders.push({
        commandId: commandId,
        tables: tables,
      });
    });

    // Attente de l'exécution de toutes les promesses
    await Promise.all(promises);

    console.log("FinalOrders prêt pour génération :", finalOrders);

    // Téléchargement du fichier JSON contenant les commandes
    this.downloadJsonFile(finalOrders);

    return finalOrders;
  }


  // Fonction pour télécharger le fichier JSON généré
  downloadJsonFile(jsonData: any) {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
