import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MenuComponent } from './components/menu/menu.component';
import { TableReservationComponent } from './components/table-reservation/table-reservation.component';
import { HomeComponent } from './components/home/home.component';
import {CustomerCountComponent} from "./components/customer-count/customer-count.component";
import {CategoryComponent} from "./components/category/category.component";
import {TableCategoriesComponent} from "./components/table-categories/table-categories.component";
import {HeaderComponent} from "./components/header/header.component";
import {PaymentReviewComponent} from "./components/payment-review/payment-review.component";
import {PaymentMethodComponent} from "./components/payment-method/payment-method.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'menu', component: MenuComponent},
  { path: 'category', component: CategoryComponent },
  { path: 'table-categories', component: TableCategoriesComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'table-reservation/:count/:tableNumberGlobal', component: TableReservationComponent },
  { path: 'payment-method/:count', component: PaymentMethodComponent },
  { path: 'customer-count', component: CustomerCountComponent, data:{type:"customerCount"} },
  { path: 'orderId', component: CustomerCountComponent, data:{type:"orderId"} },
  { path: 'payment-review/:orderId/:tableNumber', component: PaymentReviewComponent }



];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {
  }
