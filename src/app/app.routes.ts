import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MenuComponent } from './components/menu/menu.component';
import { TableReservationComponent } from './components/table-reservation/table-reservation.component';
import { HomeComponent } from './components/home/home.component';
import {CustomerCountComponent} from "./Customer_count/customer-count/customer-count.component";

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'menu', component: MenuComponent},
    { path: 'table-reservation', component: TableReservationComponent },
  { path: 'customer-count', component: CustomerCountComponent }


];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {
  }
