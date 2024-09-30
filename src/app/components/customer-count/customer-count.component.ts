import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {TableService} from "../table.service";

@Component({
  selector: 'app-customer-count',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './customer-count.component.html',
  styleUrls: ['./customer-count.component.scss']
})

export class CustomerCountComponent {
  count: string = '0'; // Représente le nombre de clients
  tableNumber: string = '';  // Numéro de table généré sous forme "XXX"
  createdOrder: any; // Pour stocker la commande créée
  existingTableNumbers: string[] = []; // Stocke les numéros de tables existantes

  constructor(private router: Router, private tableService: TableService) {}

  // Incrémente le nombre de clients
  increment() {
    this.count = (parseInt(this.count) + 1).toString();
  }

  // Décrémente le nombre de clients
  decrement() {
    const currentCount = parseInt(this.count);
    if (currentCount > 0) {
      this.count = (currentCount - 1).toString();
    }
  }

  // Ajoute un chiffre au compteur
  appendNumber(value: string) {
    if (this.count === '0') {
      this.count = value;  // Remplace le zéro initial
    } else {
      this.count += value;  // Ajoute le nombre
    }
  }

  // Réinitialise le compteur
  clearNumber() {
    this.count = '0';  // Réinitialise à zéro
  }

  // Supprime le dernier chiffre du compteur
  deleteLast() {
    this.count = this.count.length > 1 ? this.count.slice(0, -1) : '0';  // Supprime le dernier caractère
  }

  // Génére un numéro de table de type XXX qui n'existe pas déjà
  generateUniqueTableNumber(): string {
    let tableNumber: string;
    do {
      tableNumber = Math.floor(100 + Math.random() * 900).toString(); // Génére un nombre entre 100 et 999
    } while (this.existingTableNumbers.includes(tableNumber));  // Vérifie si le numéro existe déjà
    return tableNumber;
  }

  // Valide le nombre de clients et génère un ordre global
  validateButton() {
    const customersCount = parseInt(this.count);  // Récupère le nombre de clients sous forme numérique

    this.tableService.getAllTables().subscribe(tables => {
      // Stocke tous les numéros de tables existants
      this.existingTableNumbers = tables.map((table: any) => table.number);


      this.tableNumber = this.generateUniqueTableNumber();

      // Crée ensuite la table
      this.createTable(this.tableNumber, customersCount);
      this.router.navigate(['/table-reservation', this.count,this.tableNumber]);
    });


  }

  // Crée la table et l'ordre global
  createTable(tableNumber: string, customersCount: number) {
    this.tableService.createTable(parseInt(tableNumber)).subscribe(response => {
      console.log('Table créée avec succès', response);
      console.log(response.number, customersCount)
      this.createTableOrder(response.number, customersCount);
    });
  }
  createTableOrder(tableNumber: string, customersCount: number) {
    const tableNumberInt = parseInt(tableNumber, 10);  // Conversion

    console.log('Envoi de la requête avec les données:', { tableNumber: tableNumberInt, customersCount });

    this.tableService.createTableOrder(tableNumberInt, customersCount).subscribe(
      (order) => {
        console.log('Ordre global créé avec succès', order);
        this.createdOrder = order;
      },
      (error) => {
        console.error('Erreur lors de la création de la commande:', error);
      }
    );
  }

}
