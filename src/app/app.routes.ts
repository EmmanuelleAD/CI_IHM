import {RouterModule, Routes} from '@angular/router';
import {CustomerCountComponent} from "./Customer_count/customer-count/customer-count.component";
import {NgModule} from "@angular/core";

export const routes: Routes = [
  { path: '', redirectTo: '/customer-count', pathMatch: 'full' },
  { path: 'customer-count', component: CustomerCountComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],  // Configurez les routes avec RouterModule
  exports: [RouterModule]  // Exportez RouterModule pour l'utiliser dans d'autres modules
})
export class AppRoutingModule { }
