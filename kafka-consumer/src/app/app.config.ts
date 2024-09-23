import { ApplicationConfig, provideZoneChangeDetection , importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(), importProvidersFrom(CommonModule)],
};
