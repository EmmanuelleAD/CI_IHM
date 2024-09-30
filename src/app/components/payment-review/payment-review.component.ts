import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
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
export class PaymentReviewComponent implements OnInit {
  command: any = {};
  selectedTable: any = {};
  selectedClients: any[] = [];
  storage: Storage | null = null;
  tableNumber: number | null = null;
  commandId: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // Vérifier si le code est exécuté côté navigateur
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = null;
    }

    // Récupérer les paramètres de l'URL (tableNumber et orderId)
    this.route.params.subscribe(params => {
      this.tableNumber = +params['tableNumber'];
      this.commandId = +params['orderId'];
      console.log("Table Number from URL:", this.tableNumber);
      this.loadCommandFromFile();  // Charger les données JSON depuis le serveur
    });
  }

  ngOnInit() {
    // Écouter les changements dans le localStorage depuis d'autres onglets/bornes
    window.addEventListener('storage', (event) => {
      if (event.key === 'Command') {
        const updatedCommands = JSON.parse(event.newValue || '[]');
        console.log('Commande mise à jour depuis une autre borne :', updatedCommands);

        // Mettre à jour l'état local avec la nouvelle commande si elle correspond à l'ID en cours
        const command = updatedCommands.find((cmd: any) => cmd.commandId === this.commandId);
        if (command) {
          this.command = command;
          this.selectedTable = this.command.tables.find((table: any) => +table.tableNumber === this.tableNumber);
          console.log('Table mise à jour :', this.selectedTable);
        }
      }
    });
  }

  // Charger les données JSON depuis le fichier local
  loadCommandFromFile() {
    const jsonFilePath = 'assets/Commands.json';  // Chemin du fichier JSON

    this.http.get<any>(jsonFilePath).subscribe(
      data => {
        this.command = data.find((cmd: any) => cmd.commandId === this.commandId);
        console.log('Command after loading from file:', this.command);

        if (this.command) {
          this.selectedTable = this.command.tables.find((table: any) => +table.tableNumber === this.tableNumber);
          if (!this.selectedTable) {
            console.error("Table non trouvée pour le numéro :", this.tableNumber);
          }
        } else {
          console.error("Commande non trouvée pour l'ID :", this.commandId);
        }
      },
      error => {
        console.error('Erreur lors du chargement du fichier JSON', error);
      }
    );
  }

  // Calculer le total pour un client donné
  calculateClientTotal(client: any): number {
    return client.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
  }

  // Sélectionner ou désélectionner un client
  toggleClientSelection(client: any) {
    const index = this.selectedClients.indexOf(client);
    if (index === -1) {
      this.selectedClients.push(client);
    } else {
      this.selectedClients.splice(index, 1);
    }
  }

  // Calculer le total des clients sélectionnés
  calculateSelectedClientsTotal(): number {
    return this.selectedClients.reduce((sum, client) => sum + this.calculateClientTotal(client), 0);
  }

  // Action de paiement
  payOrder() {
    // Marquer tous les clients sélectionnés comme ayant payé
    this.selectedClients.forEach(client => {
      client.clientPaid = true;
    });

    // Réinitialiser la sélection de clients
    this.selectedClients = [];

    // Vérifier si la table entière est payée
    this.checkIfTableIsPaid();

    // Sauvegarder la commande mise à jour dans le localStorage
    this.saveCommandToStorage();
  }

  // Vérifier si tous les clients de la table ont payé
  checkIfTableIsPaid() {
    const allClientsPaid = this.selectedTable.clients.every((client: any) => client.clientPaid);
    this.selectedTable.tablePaid = allClientsPaid;
  }

  // Sauvegarder la commande dans le localStorage
  saveCommandToStorage() {
    const commandIndex = this.command.tables.findIndex((table: any) => +table.tableNumber === this.tableNumber);
    this.command.tables[commandIndex] = this.selectedTable;

    // Récupérer les commandes déjà existantes dans le localStorage
    const storedCommands = JSON.parse(this.storage?.getItem("Command") || '[]');
    const existingCommandIndex = storedCommands.findIndex((cmd: any) => cmd.commandId === this.commandId);

    // Mettre à jour la commande existante ou l'ajouter si elle n'existe pas
    if (existingCommandIndex > -1) {
      storedCommands[existingCommandIndex] = this.command;
    } else {
      storedCommands.push(this.command);
    }

    this.storage?.setItem("Command", JSON.stringify(storedCommands));  // Sauvegarder dans le localStorage
    console.log("Commande mise à jour sauvegardée dans le localStorage :", this.command);
  }

  // Vérifier si un client est sélectionné
  isClientSelected(client: any): boolean {
    return this.selectedClients.includes(client);
  }

  // Vérifier si un client a payé
  hasClientPaid(client: any): boolean {
    return client.clientPaid;
  }

  // Définir la classe CSS pour le bouton en fonction du statut de paiement ou de sélection du client
  getClientButtonClass(client: any): string {
    if (this.hasClientPaid(client)) {
      return 'paid';  // Vert si payé
    } else if (this.isClientSelected(client)) {
      return 'selected';  // Bleu si sélectionné
    }
    return 'default';  // Gris par défaut
  }
}
