import { Component } from '@angular/core';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {
  itemImageUrl: String ='';
  itemName: String ='';
  category :String ='';


  constructor() {
    
  }
}
