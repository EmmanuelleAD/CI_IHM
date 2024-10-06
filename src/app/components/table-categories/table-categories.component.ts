import {Component, inject, OnInit} from '@angular/core';
import {CategoryComponent} from "../category/category.component";
import {Category} from "../../interfaces/Category";
import {CATEGORIES} from "../../constants";
import {AsyncPipe, JsonPipe, NgForOf, NgIf} from "@angular/common";
import {HeaderComponent} from "../header/header.component";
import {RouterLink} from "@angular/router";
import {Observable} from "rxjs";

import { Store} from "@ngrx/store";
import {selectCommandNumber, selectCurrentClient} from "../../stores/command.selectors";
import {ClientPosition} from "../../interfaces/ClientPosition";
import {MatCard, MatCardContent, MatCardHeader} from "@angular/material/card";
import {MatCardModule} from '@angular/material/card';
import {filter, map} from "rxjs/operators";
import {MatButton} from "@angular/material/button";

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
    MatCardHeader, MatCardModule, MatButton
  ],
  templateUrl: './table-categories.component.html',
  styleUrl: './table-categories.component.scss'
})
export class TableCategoriesComponent implements OnInit{
  private store=inject(Store)

  currentClient$:Observable<ClientPosition|null>=this.store.select(selectCurrentClient);
  commandNumber$:Observable<number>=this.store.select(selectCommandNumber);
  commandNumber:number=-1

  public  categories:Category[]=CATEGORIES
  constructor() {

  }

  ngOnInit(): void {
    this.commandNumber$.subscribe(cmdNumber=>this.commandNumber=cmdNumber)

  }



}
