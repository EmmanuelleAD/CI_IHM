import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MenuComponent } from './components/menu/menu.component';
import { TableReservationComponent } from './components/table-reservation/table-reservation.component';
import { HomeComponent } from './components/home/home.component';
import {CustomerCountComponent} from "./Customer_count/customer-count/customer-count.component";
import {CategoryComponent} from "./components/category/category.component";
import {TableCategoriesComponent} from "./components/table-categories/table-categories.component";
import {HeaderComponent} from "./components/header/header.component";

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'menu', component: MenuComponent},
    { path: 'table-reservation', component: TableReservationComponent },
  { path: 'customer-count', component: CustomerCountComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'table-categories', component: TableCategoriesComponent },
  { path: 'header', component: HeaderComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {
  }
