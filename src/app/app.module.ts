import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';  // Import NgbModule
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { HomeComponent } from './features/home/home.component';
import { MenuComponent } from './components/menu/menu.component';

import { MenuServiceService } from './services/menu-service.service';
import { AppRoutingModule } from './app.routes';


 // Example component

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    NgbDatepickerModule,
    AppRoutingModule
  ],
  providers: [MenuServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
