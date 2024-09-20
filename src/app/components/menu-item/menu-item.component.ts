import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../interfaces/MenuItem'; 

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {
  @Input() item!: MenuItem; 
  @Output() quantityChanged = new EventEmitter<{ itemId: string, quantity: number }>();  // Emet des infos sur l'item et la quantité
  
  constructor() {}
  
  // Méthode pour augmenter la quantité
  increaseQuantity() {
    this.item.quantity += 1;
   this.emitQuantityChange();
  }
  
  // Méthode pour diminuer la quantité
  decreaseQuantity() {
    if (this.item.quantity > 0) {
      this.item.quantity -= 1;
      this.emitQuantityChange();
    }
  }
  
   // Emet un événement avec l'ID de l'item et la nouvelle quantité
  private emitQuantityChange() {
    this.quantityChanged.emit({ itemId: this.item._id, quantity: this.item.quantity });
  }

}
