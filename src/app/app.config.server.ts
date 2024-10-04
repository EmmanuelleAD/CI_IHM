import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideStore } from '@ngrx/store';
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideStore()
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
