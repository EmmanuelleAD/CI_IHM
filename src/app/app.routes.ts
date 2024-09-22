import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MenuComponent } from './components/menu/menu.component';
import { TableReservationComponent } from './components/table-reservation/table-reservation.component';
import { HomeComponent } from './components/home/home.component';
import {CustomerCountComponent} from "./components/customer-count/customer-count.component";
import {PaymentComponent} from "./components/payment/payment.component";

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'menu', component: MenuComponent},
  { path: 'table-reservation/:count', component: TableReservationComponent },
  { path: 'customer-count', component: CustomerCountComponent },
  { path: 'payment', component: PaymentComponent }


];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {
  }
