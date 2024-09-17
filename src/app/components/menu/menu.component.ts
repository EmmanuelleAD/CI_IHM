import { Component, OnInit  } from '@angular/core';
import { MenuItemComponent } from '../../../../src/app/components/menu-item/menu-item.component';
import {Router} from '@angular/router';
import { MenuServiceService } from '../../../../src/app/services/menu-service.service';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit{
  item: MenuItemComponent[] = [];

  constructor(  public menuServiceService: MenuServiceService, public router :Router) {
  }

  ngOnInit() {
    this.displayAllItems();
  }

  displayAllItems(){
    this.menuServiceService.getAllItems().subscribe((data: any) => {
        console.log(data);
    });

  }


}
