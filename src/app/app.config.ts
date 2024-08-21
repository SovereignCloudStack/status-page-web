import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { Configuration } from '../external/lib/status-page-api/angular-client';
import { AppConfigService, CONFIG_JSON } from './app-config.service';

export function buildAppConfig(jsonConfig: any): ApplicationConfig {
  return {
    providers: [
      provideRouter(routes),
      importProvidersFrom(HttpClientModule),
      {
        provide: CONFIG_JSON,
        useValue: jsonConfig
      },
      {
        provide: Configuration,
        useFactory: (appConfig: AppConfigService) => {
          return new Configuration(
          {
            basePath: appConfig.apiServerUrl,
            
          })
        },
        deps: [AppConfigService],
        multi: false
      }
    ]
  };
}

