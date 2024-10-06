import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';  // Ajout de HttpClient pour charger un fichier JSON depuis le serveur
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';  // Import NgRx Store
import {forkJoin, Observable, take} from 'rxjs';
import {CommandState} from "../../stores/command.reducer";
import {selectCommands} from "../../stores/command.selectors";
import {map} from "rxjs/operators";
import {Command} from "../../interfaces/Command";
import {payForClient, setCommands} from "../../stores/command.action";
import {OrderService} from "../orderService";
import {OrderDictionary} from "../table-reservation/table-reservation.component";


@Component({
  selector: 'app-payment-review',
  templateUrl: './payment-review.component.html',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule
  ],
  styleUrls: ['./payment-review.component.scss']
})
export class PaymentReviewComponent implements OnInit {

  command$: Observable<Command> = new Observable();
  selectedTable: any = {};
  selectedClients: any[] = [];
  tableNumber: number | null = null;
  commandId: number | undefined;
  private CommandActions: any;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any,
    private store: Store<{ commands: CommandState }>,private orderService:OrderService
  ) {
    // Récupérer les paramètres de l'URL (tableNumber et orderId)
    this.route.params.subscribe(params => {
      this.tableNumber = +params['tableNumber'];
      this.commandId = +params['orderId'];
      console.log("Table Number from URL:", this.tableNumber);

      this.command$ = this.store.select(selectCommands).pipe(map(command=>command[0]))

    });
  }
  ngOnInit() {
    this.command$.subscribe(command => {
      if (command) {
        console.log("Commande reçue :", command);

        this.selectedTable = command.tables.find((table: any) => +table.tableNumber === this.tableNumber);
        console.log('Table sélectionnée :', this.selectedTable);

        // Vérification si la table existe bien
        if (!this.selectedTable) {
          console.error("Table non trouvée pour le numéro de table:", this.tableNumber);
          return;
        }

        // Itérer sur chaque client de la table pour récupérer les détails de la commande via le backend
        this.selectedTable?.clients.forEach((client: any) => {
          console.log('Client trouvé :', client);

          if (client.orderId) {
            console.log(`Récupération des détails de la commande pour le client avec orderId : ${client.orderId}`);
            this.http.get(`http://localhost:3001/tableOrders/${client.orderId}`).subscribe({
              next: (orderDetails: any) => {
                console.log(`Détails de la commande reçus pour le client ${client.clientId}`, orderDetails);

                client.items = []; // Initialiser les items pour le client
                client.total = 0;  // Initialiser le total pour le client

                // Itérer sur chaque ligne de commande pour récupérer les détails et le prix de chaque item
                orderDetails.lines.forEach((item: any) => {
                  this.http.get(`http://localhost:3000/menus/${item.item._id}`).pipe(take(1)).subscribe({
                    next: (menuItem: any) => {
                      console.log(`Détails du menu reçu pour l'item ${item.item._id}`, menuItem);

                      // Ajouter les détails de l'item à la liste du client
                      client.items.push({
                        itemId: item.item._id,
                        shortName: menuItem.shortName,
                        quantity: item.howMany,
                        price: menuItem.price || 0  // Utiliser un prix par défaut si absent
                      });

                      // Ajouter au total du client
                      client.total += (menuItem.price || 0) * item.howMany;
                      console.log(`Total actuel pour le client ${client.clientId} :`, client.total);
                    },
                    error: (error) => {
                      console.error(`Erreur lors de la récupération du prix pour l'item ${item.item._id}`, error);
                    }
                  });
                });
              },
              error: (error) => {
                console.error(`Erreur lors de la récupération des détails de la commande pour le client ${client.clientId}`, error);
              }
            });
          } else {
            console.error(`Client sans orderId trouvé : ${client.clientId}`);
          }
        });
      } else {
        console.error('Aucune commande reçue.');
      }
    });
  }


  calculateClientTotal(client: any): number {
    if (!client.items || client.items.length === 0) {
      return 0;
    }
    return client.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
  }

  toggleClientSelection(client: any) {
    const index = this.selectedClients.indexOf(client);
    if (index === -1) {
      this.selectedClients.push(client);
    } else {
      this.selectedClients.splice(index, 1);
    }
  }

  calculateSelectedClientsTotal(): number {
    return this.selectedClients.reduce((sum, client) => sum + this.calculateClientTotal(client), 0);
  }

  payOrder() {
    // Vérifie et traite le paiement pour chaque client sélectionné
    this.selectedClients.forEach(client => {
      const clientNumber = this.selectedTable.clients.indexOf(client) + 1;
      console.log(`Paiement pour le client ${client.clientId}, clientNumber: ${clientNumber}`);

      // Marquer le client comme payé localement
      client.clientPaid = true;

      // Dispatch pour marquer le client comme payé dans le store
      this.store.dispatch(payForClient({
        tableNumber: this.tableNumber as number,
        clientNumber: clientNumber
      }));

      // Facturer le client via une requête HTTP en utilisant son `orderId`
      this.processClientPayment(client);
    });

    // Vérifier si tous les clients de la table ont payé
    const allClientsPaid = this.selectedTable.clients.every((client: any) => client.clientPaid);
    console.log(`Tous les clients ont payé : ${allClientsPaid}`);
    if (allClientsPaid) {
      this.completeTablePayment();
    } else {
      console.log("Certains clients n'ont pas encore payé.");
    }
  }


// Méthode pour facturer un client en fonction de son `orderId`
  processClientPayment(client: any): void {
    if (client.orderId) {
      this.http.post(`http://localhost:3001/tableOrders/${client.orderId}/bill`, {})
        .subscribe({
          next: () => {
            console.log(`Client ${client.client} successfully paid.`);
          },
          error: (error) => {
            console.error(`Error processing payment for client ${client.client}:`, error);
          }
        });
    } else {
      console.error('Order ID for client not found.');
    }
  }

  completeTablePayment() {
    console.log("Paiement final pour la table numéro", this.tableNumber);

    this.http.get(`http://localhost:3001/tables/${this.tableNumber}`)
      .subscribe((response: any) => {
        console.log("Réponse reçue pour les informations de la table :", response);

        if (response && response.tableOrderId) {
          const tableOrderId = response.tableOrderId;
          console.log("ID de la commande de la table :", tableOrderId);

          // Requête pour facturer la table
          this.http.post(`http://localhost:3001/tableOrders/${tableOrderId}/bill`, {})
            .subscribe(() => {
              console.log('La table a été facturée et fermée avec succès');
            }, error => {
              console.error('Erreur lors du paiement de la table:', error);
            });
        } else {
          console.error('ID de la commande pour la table non trouvé');
        }
      }, error => {
        console.error('Erreur lors de la récupération des informations de la table:', error);
      });
  }



  isClientSelected(client: any): boolean {
    return this.selectedClients.includes(client);
  }

  hasClientPaid(client: any): boolean {
    return client.clientPaid;
  }

  getClientButtonClass(client: any): string {
    if (this.hasClientPaid(client)) {
      return 'paid';  // Vert si payé
    } else if (this.isClientSelected(client)) {
      return 'selected';  // Bleu si sélectionné
    }
    return 'default';  // Gris par défaut
  }
  takeMeHome(){
  //  this.route.navigate(['/home']);
  }
}
