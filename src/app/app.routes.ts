import { Routes } from '@angular/router';
import { TableReservationComponent } from './features/table-reservation/table-reservation.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'table-reservation', component: TableReservationComponent },
];

