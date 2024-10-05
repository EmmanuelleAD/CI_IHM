import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';  // Ajout de HttpClient pour charger un fichier JSON depuis le serveur
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';  // Import NgRx Store
import { Observable } from 'rxjs';
import {CommandState} from "../../stores/command.reducer";
import {selectCommands} from "../../stores/command.selectors";
import {map} from "rxjs/operators";
import {Command} from "../../interfaces/Command";
import {payForClient} from "../../stores/command.action";


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
    private store: Store<{ commands: CommandState }>
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
        this.selectedTable = command.tables.find((table: any) => +table.tableNumber === this.tableNumber);
        console.log('Table mise à jour :', this.selectedTable);
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

      // Dispatch pour marquer le client comme payé dans le store
      this.store.dispatch(payForClient({
        tableNumber: this.tableNumber as number,
        clientNumber: clientNumber
      }));

      // Facturer le client via une requête HTTP en utilisant son `orderId`
      this.processClientPayment(client);
    });

    // Vérifier si tous les clients de la table ont payé et compléter le paiement de la table si c'est le cas
    const allClientsPaid = this.selectedTable.clients.every((client: any) => client.clientPaid);
    if (allClientsPaid) {
      this.completeTablePayment();
    }
  }

// Méthode pour facturer un client en fonction de son `orderId`
  processClientPayment(client: any): void {
    if (client.orderId) {
      this.http.post(`http://localhost:3001/tableOrders/${client.orderId}/bill`, {})
        .subscribe({
          next: () => {
            console.log(`Client ${client.client} successfully paid.`);
            // Si nécessaire, on peut réinitialiser l'interface ou effectuer une autre action ici.
          },
          error: (error) => {
            console.error(`Error processing payment for client ${client.client}:`, error);
          }
        });
    } else {
      console.error('Order ID for client not found.');
    }
  }

  // Cette méthode gère le paiement final et libère la table
  completeTablePayment() {
    this.http.get(`http://localhost:3001/tableOrders?tableNumber=${this.tableNumber}`)
      .subscribe((response: any) => {
        if (response && response.length > 0) {
          const tableOrderId = response[0]._id;  // Récupérer l'ID de la commande

          // Deuxième requête pour facturer la table
          this.http.post(`http://localhost:3001/tableOrders/${tableOrderId}/bill`, {})
            .subscribe(() => {
              console.log('Table successfully paid and closed');
            }, error => {
              console.error('Error during table payment:', error);
            });
        } else {
          console.error('Table order not found');
        }
      }, error => {
        console.error('Error fetching table order:', error);
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
}
