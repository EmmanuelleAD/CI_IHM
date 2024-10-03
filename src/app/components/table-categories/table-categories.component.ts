import {Component, inject, OnInit} from '@angular/core';
import {CategoryComponent} from "../category/category.component";
import {Category} from "../../interfaces/Category";
import {CATEGORIES} from "../../constants";
import {AsyncPipe, JsonPipe, NgForOf, NgIf} from "@angular/common";
import {HeaderComponent} from "../header/header.component";
import {RouterLink} from "@angular/router";
import {Observable} from "rxjs";

import { Store} from "@ngrx/store";
import {selectCurrentClient} from "../../stores/command.selectors";
import {OrderClient} from "../../interfaces/OrderClient";
import {MatCard, MatCardContent, MatCardHeader} from "@angular/material/card";
import {MatCardModule} from '@angular/material/card';
import {filter, map} from "rxjs/operators";

@Component({
  selector: 'app-table-categories',
  standalone: true,
    imports: [
        CategoryComponent,
        NgForOf,
        HeaderComponent,
        RouterLink,
        AsyncPipe,
        NgIf,
        JsonPipe,
        MatCard,
        MatCardContent,
        MatCardHeader,MatCardModule
    ],
  templateUrl: './table-categories.component.html',
  styleUrl: './table-categories.component.scss'
})
export class TableCategoriesComponent implements OnInit{
  private store=inject(Store)

  currentClient$:Observable<OrderClient|null>=this.store.select(selectCurrentClient);
  commandNumber=-1


  public  categories:Category[]=CATEGORIES
  constructor() {

    console.log(this.categories)
  }

  ngOnInit(): void {
    this.currentClient$
      .pipe(
        filter((client: OrderClient | null) => !!client),
        map((client: OrderClient | null) => client?.commandNumber || -1)
      )
      .subscribe((commandNumber: number) => {
       if(commandNumber&&commandNumber!==-1) this.commandNumber = commandNumber;
      });
  }



}
