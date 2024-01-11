import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { UserCanActive } from './shared/services/auth/auth.service';
import { AuthInterceptorProviders } from './shared/services/interceptor/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
registerLocaleData(en);

export const httpLoaderFactory = (http: HttpClient): any => {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(
      TranslateModule.forChild({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    TranslateStore,
    TranslateService,
    provideNzI18n(en_US),
    UserCanActive,
    AuthInterceptorProviders
  ]
};