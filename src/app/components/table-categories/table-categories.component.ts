import {Component, inject, Input, OnInit} from '@angular/core';
import {CategoryComponent} from "../category/category.component";
import {Category} from "../../interfaces/Category";
import {CATEGORIES} from "../../constants";
import {AsyncPipe, JsonPipe, NgForOf, NgIf} from "@angular/common";
import {HeaderComponent} from "../header/header.component";
import {RouterLink} from "@angular/router";
import {Observable} from "rxjs";
import {Client} from "../../interfaces/Client";
import {CommandState} from "../../stores/command.reducer";
import {select, Store} from "@ngrx/store";
import {selectCurrentClient} from "../../stores/command.selectors";
import {OrderClient} from "../../interfaces/OrderClient";
import {getCurrentClient} from "../../stores/command.action";

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
    JsonPipe
  ],
  templateUrl: './table-categories.component.html',
  styleUrl: './table-categories.component.scss'
})
export class TableCategoriesComponent implements OnInit{
  @Input() tableNumber:number=3;
  @Input() personNumber:number=1;
  private store=inject(Store)
  commandNumber = 1234;
  currentClient$:Observable<OrderClient|null>=this.store.select(selectCurrentClient);

  public  categories:Category[]=CATEGORIES
  constructor() {

    console.log(this.categories)
  }

  ngOnInit(): void {
    this.store.dispatch(getCurrentClient({commandNumber: this.commandNumber}))
  }



}
