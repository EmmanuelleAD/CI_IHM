import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
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
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-payment-review',
  templateUrl: './payment-review.component.html',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule,
    RouterLink
  ],
  styleUrls: ['./payment-review.component.scss']
})
export class PaymentReviewComponent implements OnInit {

  command$: Observable<Command> = new Observable();
  selectedTable: any = {};
  selectedClients: any[] = [];
  tableNumber: number | null = null;
  commandId: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any,
    private store: Store<{ commands: CommandState }>,
    private orderService: OrderService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.route.params.subscribe(params => {
      this.tableNumber = +params['tableNumber'];
      this.commandId = +params['orderId'];
      this.command$ = this.store.select(selectCommands).pipe(map(command => command[0]));
    });
  }

  ngOnInit() {
    this.command$.subscribe(command => {
      if (command) {
        this.selectedTable = command.tables.find((table: any) => +table.tableNumber === this.tableNumber);
        if (!this.selectedTable) {
          console.error("Table non trouvée pour le numéro de table:", this.tableNumber);
          return;
        }

        // Itérer sur chaque client pour récupérer les détails de la commande
        this.selectedTable?.clients.forEach((client: any) => {
          if (client.orderId) {
            this.http.get(`http://localhost:3001/tableOrders/${client.orderId}`).subscribe({
              next: (orderDetails: any) => {
                client.items = [];
                client.total = 0;
                console.log(`Détails de la commande reçus pour le client `, orderDetails);

                orderDetails.lines.forEach((item: any) => {
                  this.http.get(`http://localhost:3000/menus/${item.item._id}`).pipe(take(1)).subscribe({
                    next: (menuItem: any) => {
                      client.items.push({
                        itemId: item.item._id,
                        shortName: menuItem.shortName,
                        quantity: item.howMany,
                        price: menuItem.price || 0
                      });
                      client.total += (menuItem.price || 0) * item.howMany;
                      console.log(`Total actuel pour le client :`, client.total);
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
    // Force la mise à jour
    this.changeDetectorRef.detectChanges();
  }


  payOrder() {
    this.selectedClients.forEach(client => {
      const clientNumber = this.selectedTable.clients.indexOf(client) + 1;
      console.log(`Paiement pour le client, clientNumber: ${clientNumber}`);

      // Marquer le client comme payé localement
      client.clientPaid = true;

      // Dispatch pour marquer le client comme payé dans le store
      this.store.dispatch(payForClient({
        tableNumber: this.tableNumber as number,
        clientNumber: clientNumber
      }));

      this.processClientPayment(client);
    });

    // Désélectionner les clients payés pour éviter qu'ils soient inclus dans le calcul
    this.selectedClients = this.selectedClients.filter(client => !client.clientPaid);
    this.changeDetectorRef.detectChanges();  // Forcer la mise à jour de la vue
    const allClientsPaid = this.selectedTable.clients.every((client: any) => client.clientPaid);
    if (allClientsPaid) {
      this.completeTablePayment();
    }

    // Recalculer le total avec uniquement les clients sélectionnés non payés
    this.calculateSelectedClientsTotal();
  }

  calculateSelectedClientsTotal(): number {
    return this.selectedClients
      .filter(client => !client.clientPaid)  // Ne pas inclure les clients déjà payés
      .reduce((sum, client) => sum + this.calculateClientTotal(client), 0);
  }


  processClientPayment(client: any): void {
    if (client.orderId) {
      this.http.post(`http://localhost:3001/tableOrders/${client.orderId}/bill`, {}).subscribe({
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
    this.http.get(`http://localhost:3001/tables/${this.tableNumber}`).subscribe((response: any) => {
      if (response && response.tableOrderId) {
        const tableOrderId = response.tableOrderId;
        this.http.post(`http://localhost:3001/tableOrders/${tableOrderId}/bill`, {}).subscribe(() => {
          console.log('La table a été facturée et fermée avec succès');
        }, error => {
          console.error('Erreur lors du paiement de la table:', error);
        });
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
      return 'paid';
    } else if (this.isClientSelected(client)) {
      return 'selected';
    }
    return 'default';
  }
}
