import { ApplicationConfig } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Configuration } from '../external/lib/status-page-api/angular-client';
import { AppConfigService, CONFIG_JSON } from './app-config.service';
import { authInterceptor, LogLevel, provideAuth, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';

export function buildAppConfig(jsonConfig: any): ApplicationConfig {
  return {
    providers: [      
      provideHttpClient(withInterceptors([authInterceptor()])),
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
              postLoginRoute: '/home',
              forbiddenRoute: '/forbidden',
              unauthorizedRoute: '/unauthorized',
              logLevel: LogLevel.Debug,
              historyCleanupOff: true,
              authority: appConfig.dexUrl,
              redirectUrl: appConfig.redirectUrl,
              postLogoutRedirectUri: "/", //window.location.origin,
              clientId: appConfig.dexId,
              scope: 'openid profile email offline_access',
              responseType: 'code',
              silentRenew: true,
              useRefreshToken: true,
              customParamsCodeRequest: {
                test: "foobar"
              }
            });
          },
          deps: [AppConfigService]
        },
      }),
      provideRouter(routes, withEnabledBlockingInitialNavigation()),
    ]
  };
}
