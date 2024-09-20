import { Component, OnInit  } from '@angular/core';
import { MenuItemComponent } from '../../../../src/app/components/menu-item/menu-item.component';
import {Router} from '@angular/router';
import { MenuServiceService } from '../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../interfaces/MenuItem';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule,MenuItemComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit{
  items: MenuItem[] = [];

  constructor(  public menuServiceService: MenuServiceService, public router :Router) {}

  ngOnInit() {
    this.displayAllItems();
  }

  displayAllItems(){
    //console.log('displayAllItems');
    this.menuServiceService.getAllItems().subscribe((data: any) => {
      //console.log(data);
      this.items = data.map((item: any) => ({
        ...item, 
        quantity: 0
      }));
    },
    error => {
      console.error('Error fetching items', error);
    });
  }

  displayItemsByType(type: string) {
    console.log(`displayItemsByType: ${type}`);
    this.menuServiceService.getItems(type).subscribe((data: any) => {
      console.log(data);
      this.items = data.map((item: any) => ({
        ...item, 
        quantity: 0
      }));
    },
    error => {
      console.error(`Error fetching ${type} items`, error);
    });
  }


  increaseQuantity(item: any) {
    item.quantity += 1;
  }

  // Méthode pour diminuer la quantité
  decreaseQuantity(item: any) {
    if (item.quantity > 0) {
      item.quantity -= 1;
    }
  }

  handleQuantityChange(event: { itemId: string, quantity: number }) {
    const item = this.items.find(i => i._id === event.itemId);
    if (item) {
      item.quantity = event.quantity; // Met à jour la quantité de l'item
    }
  }


}
