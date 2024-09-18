import { Component, OnInit  } from '@angular/core';
import { MenuItemComponent } from '../../../../src/app/components/menu-item/menu-item.component';
import {Router} from '@angular/router';
import { MenuServiceService } from '../../services/menu-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule,MenuItemComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit{
  items: MenuItemComponent[] = [];

  constructor(  public menuServiceService: MenuServiceService, public router :Router) {}

  ngOnInit() {
    this.displayAllItems();
  }

  displayAllItems(){
    console.log('displayAllItems');
    this.menuServiceService.getAllItems().subscribe((data: any) => {
      this.items=data;
    },
    error => {
      console.error('Error fetching items', error);
    });
  }


}
