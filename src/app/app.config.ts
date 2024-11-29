import { ApplicationConfig } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';

import { provideAnimations } from '@angular/platform-browser/animations'

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Configuration } from '../external/lib/status-page-api/angular-client';
import { AppConfigService, CONFIG_JSON } from './services/app-config.service';
import { authInterceptor, LogLevel, provideAuth, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';
import { provideToastr } from 'ngx-toastr';

export function buildAppConfig(jsonConfig: any): ApplicationConfig { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    providers: [
      provideHttpClient(withInterceptors([authInterceptor()])),
      {
        provide: CONFIG_JSON,
        useValue: jsonConfig
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
              logLevel: LogLevel.Warn,
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
          },
          deps: [AppConfigService]
        },
      }),
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
      provideRouter(routes, withEnabledBlockingInitialNavigation()),
      provideAnimations(),
      provideToastr({
        progressBar: true
      })
    ]
  };
}
