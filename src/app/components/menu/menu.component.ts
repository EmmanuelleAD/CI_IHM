import { Component, OnInit  } from '@angular/core';
import { MenuItemComponent } from '../../../../src/app/components/menu-item/menu-item.component';
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
  cart: MenuItem[] = [];

  constructor(  public menuServiceService: MenuServiceService) {}

  ngOnInit() {
    this.displayAllItems();
    this.loadCart(); 
  }

  displayAllItems(){
    //console.log('displayAllItems');
    this.menuServiceService.getAllItems().subscribe((data: any) => {
      this.items = data.map((item: MenuItem) => {
        const cartItem = this.cart.find(i => i._id === item._id);
        return {
          ...item,
          quantity: cartItem ? cartItem.quantity : 0  // Charger la quantité sauvegardée ou initialiser à 0
        };
      });
    },
    error => {
      console.error('Error fetching items', error);
    });
  }

  displayItemsByType(type: string) {
    console.log(`displayItemsByType: ${type}`);
    this.menuServiceService.getItems(type).subscribe((data: any) => {
      this.items = data.map((item: MenuItem) => {
        const cartItem = this.cart.find(i => i._id === item._id);
        return {
          ...item,
          quantity: cartItem ? cartItem.quantity : 0  // Charger la quantité sauvegardée ou initialiser à 0
        };
      });
    },
    error => {
      console.error(`Error fetching ${type} items`, error);
    });
  }


  increaseQuantity(item: any) {
    item.quantity += 1;
    this.updateCart(item)
  }

  // Méthode pour diminuer la quantité
  decreaseQuantity(item: any) {
    if (item.quantity > 0) {
      item.quantity -= 1;
      this.updateCart(item)
    }
  }

  handleQuantityChange(event: { itemId: string, quantity: number }) {
    const item = this.items.find(i => i._id === event.itemId);
    if (item) {
      item.quantity = event.quantity; // Met à jour la quantité de l'item
      this.updateCart(item)
    }
  }

  loadCart() {
    console.log("hello")
    const storedCart = localStorage.getItem('cart');
    console.log(storedCart)
    if (storedCart) {
      this.cart = JSON.parse(storedCart);
    }
  }

  updateLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }


  updateCart(item: MenuItem) {
    console.log("updateCart")
    const existingItem = this.cart.find(i => i._id === item._id);
    if (item.quantity > 0) {
      if (existingItem) {
        existingItem.quantity = item.quantity; 
      } else {
        this.cart.push({ ...item }); 
      }
    } else if (existingItem) {
      this.cart = this.cart.filter(i => i._id !== item._id); 
    }
    this.updateLocalStorage(); 
  }

  validateCart() {
    console.log('Cart validated', this.cart);
    this.cart = [];
    localStorage.removeItem('cart');
  }

  getTotal(): number {
    let total = 0;
    this.cart.forEach(item => {
      total += item.price * item.quantity;
    });
    return total;
  }

  
  onCartClick(): void {
    console.log('Cart clicked!');

  }

}
