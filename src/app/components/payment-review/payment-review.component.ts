import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';  // Ajout de HttpClient pour charger un fichier JSON depuis le serveur
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';

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
export class PaymentReviewComponent {
  command: any = {};
  selectedTable: any = {};
  selectedClients: any[] = [];
  storage: Storage | null = null;
  tableNumber: number | null = null;

  constructor(
      private route: ActivatedRoute,
      private http: HttpClient,
      @Inject(PLATFORM_ID) private platformId: any
  ) {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = null;
    }


    this.route.params.subscribe(params => {
      this.tableNumber = +params['tableNumber'];
      console.log("Table Number from URL:", this.tableNumber);
      this.loadCommandFromFile();  // Charger les données JSON depuis le serveur
    });
  }


  loadCommandFromFile() {
    const jsonFilePath = 'assets/Commands.json';

    this.http.get<any>(jsonFilePath).subscribe(
        data => {
          this.command = data[0];
          console.log('Command after loading from file:', this.command);

          this.selectedTable = this.command.tables.find((table: any) => +table.tableNumber === this.tableNumber);
          if (!this.selectedTable) {
            console.error("Table non trouvée pour le numéro :", this.tableNumber);
          }
        },
        error => {
          console.error('Erreur lors du chargement du fichier JSON', error);
        }
    );
  }



  calculateClientTotal(client: any): number {
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

    this.selectedClients.forEach(client => {
      client.clientPaid = true;
    });


    this.selectedClients = [];


    this.checkIfTableIsPaid();


    this.saveCommandToStorage();
  }

  checkIfTableIsPaid() {
    const allClientsPaid = this.selectedTable.clients.every((client: any) => client.clientPaid);
    this.selectedTable.tablePaid = allClientsPaid;
  }


  saveCommandToStorage() {
    const commandIndex = this.command.tables.findIndex((table: any) => +table.tableNumber === this.tableNumber);
    this.command.tables[commandIndex] = this.selectedTable;

    this.storage?.setItem("Command", JSON.stringify([this.command]));  // Sauvegarder dans le localStorage
    console.log("Commande mise à jour sauvegardée dans le localStorage :", this.command);
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
