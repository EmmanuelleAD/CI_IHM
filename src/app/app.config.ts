import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {provideState, provideStore} from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {commandReducer, commandsFeature} from "./stores/command.reducer";
import { reservationFeature } from './components/table-reservation/reservation.reducer';
import {submitOrderForClient$} from "./stores/command.effect";


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(), provideAnimationsAsync(), provideStore(),provideState(reservationFeature),provideState(commandsFeature), provideEffects({submitOrderForClient$}), provideAnimationsAsync()]
};
