import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptors/auth-interceptor';
import { errorInterceptor } from './core/auth/interceptors/error-interceptor';
import { loadingInterceptor } from './core/auth/interceptors/loading-interceptor';
import { organizationInterceptor } from './core/auth/interceptors/organization-interceptor';
import { securityPayloadInterceptor } from './core/auth/interceptors/security-payload-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        authInterceptor,
        organizationInterceptor,
        securityPayloadInterceptor, // Añadido para sanitizar respuestas sensibles
        errorInterceptor
      ])
    ),
    provideAnimations(), // Add provideAnimations here
    provideAnimations(), // Add provideAnimations here
  ]
};