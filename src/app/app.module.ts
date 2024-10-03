import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';  // Import NgbModule
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';


import { MenuServiceService } from './services/menu-service.service';
import { AppRoutingModule } from './app.routes';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";




@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    NgbModule,
    NgbDatepickerModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [MenuServiceService],
  bootstrap: []
})
export class AppModule { }
