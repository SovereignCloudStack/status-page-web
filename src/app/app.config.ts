import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { Configuration } from 'scs-status-page-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    {
      provide: Configuration,
      useFactory: () => new Configuration(
        {
          basePath: "http://api.test:8080",
          
        },
      ),
      deps: [],
      multi: false
    }
  ]
};
