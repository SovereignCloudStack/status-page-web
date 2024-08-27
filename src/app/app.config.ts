import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { Configuration } from '../external/lib/status-page-api/angular-client';
import { AppConfigService, CONFIG_JSON } from './app-config.service';
import { provideAuth, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';

export function buildAppConfig(jsonConfig: any): ApplicationConfig {
  return {
    providers: [      
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
            basePath: appConfig.apiServerUrl
          })
        },
        deps: [AppConfigService],
        multi: false
      },
      provideAuth({
        loader: {
          provide: StsConfigLoader,
          useFactory: (appConfig: AppConfigService) => {
            return new StsConfigStaticLoader({
              triggerAuthorizationResultEvent: true,
              //postLoginRoute: '/home',
              //forbiddenRoute: '/forbidden',
              //unauthorizedRoute: '/unauthorized',
              //logLevel: LogLevel.Debug,
              historyCleanupOff: true,
              authority: appConfig.dexUrl,
              redirectUrl: appConfig.redirectUrl,
              postLogoutRedirectUri: "/", //window.location.origin,
              clientId: appConfig.dexId,
              scope: 'openid profile email offline_access',
              responseType: 'code',
              silentRenew: true,
              useRefreshToken: true,
            });
          }
        }
      }),
      provideRouter(routes),
    ]
  };
}
