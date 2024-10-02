import {Component, inject, OnInit} from '@angular/core';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { MenuServiceService } from '../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../interfaces/MenuItem';
import {HeaderComponent} from "../header/header.component";
import {Store} from "@ngrx/store";
import {Observable, of, switchMap} from "rxjs";
import {OrderClient} from "../../interfaces/OrderClient";
import {selectCurrentClient, selectIsTheFirstToCommand} from "../../stores/command.selectors";
import {
  addItemForClient,
  finishToCommandForClient,
  isTheFirstToCommand,
  removeItemForClient
} from "../../stores/command.action";
import {Item} from "../../interfaces/Item";
import {Router} from "@angular/router";
import {filter, map} from "rxjs/operators";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {CommandDescriptionComponent} from "../command-description/command-description.component";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, MenuItemComponent, HeaderComponent, MatDialogModule, MatButton, MatCard, MatCardHeader, MatCardContent, MatCardSubtitle, MatCardTitle],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit{
  items: MenuItem[] = [];
  cart: MenuItem[] = [];
  private store=inject(Store);
  commandNumber:number=-1;
  currentClient$:Observable<OrderClient|null>=this.store.select(selectCurrentClient).pipe( );
  isTheFirst$?: Observable<boolean>=
  this.currentClient$.pipe(
    filter((client: OrderClient | null) => !!client),
  map((client: OrderClient | null) => {
  if (client) {
    this.commandNumber=client.commandNumber
    return this.store.select(selectIsTheFirstToCommand(client.commandNumber, client.clientNumber));
  }
  return of(true);
}),
switchMap((isFirstObservable: Observable<boolean>) => isFirstObservable)
);
  constructor(  public menuServiceService: MenuServiceService,  private router: Router,public dialog: MatDialog) {}

  ngOnInit() {
  this.menuServiceService.items$.subscribe(
    (data: any) => {
      this.items = data.map((item: MenuItem) => {
        const cartItem = this.cart.find(i => i._id === item._id);
        return {
          ...item,
          quantity: cartItem ? cartItem.quantity : 0  // Charger la quantité sauvegardée ou initialiser à 0
        };
      });
    }
  )
    this.loadCart();
  }

  displayAllItems(){
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
  }


  increaseQuantity(commandNumber: number, tableNumber: number, clientIndex: number, itemToIncrease: MenuItem) {
    itemToIncrease.quantity += 1;
    this.updateCart(itemToIncrease)
    const item:Item={itemId:itemToIncrease._id,quantity:itemToIncrease.quantity,price:itemToIncrease.price,title:itemToIncrease.fullName}
    this.store.dispatch(addItemForClient({ commandNumber, tableNumber, clientIndex,item:item  }));
  }
  // Méthode pour diminuer la quantité
  decreaseQuantity(commandNumber: number, tableNumber: number, clientIndex: number, itemToRemove: MenuItem) {
    if (itemToRemove.quantity > 0) {
      itemToRemove.quantity -= 1;
      this.updateCart(itemToRemove) ;
      const item:Item={itemId:itemToRemove._id,quantity:itemToRemove.quantity,price:itemToRemove.price,title:itemToRemove.fullName}
      this.store.dispatch(removeItemForClient({ commandNumber, tableNumber, clientIndex,itemToRemove:item  }));
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

  validateCart(commandNumber:number, tableNumber:number, clientIndex:number) {
    console.log('Cart validated', this.cart);
    this.cart = [];
    localStorage.removeItem('cart');
    this.store.dispatch(finishToCommandForClient({ commandNumber, tableNumber, clientNumber: clientIndex  }));
    this.router.navigate(['/table-categories']);
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
  isTheFirstToOrder(commandNumber:number,clientNumber:number):Observable<boolean>{
    console.log("in the first order")
    return this.store.select(selectIsTheFirstToCommand(commandNumber, clientNumber));
  }

  openCopyModal(orderClient:OrderClient) {
  this.dialog.open(CommandDescriptionComponent, {data: {orderClient: orderClient}, width: '80%',
    height: '80%'});
  }
}
