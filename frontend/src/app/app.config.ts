import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { routes } from './app.routes';
import { AuthInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ HTTP Interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    // ✅ Zone optimization
    provideZoneChangeDetection({ eventCoalescing: true }),

    // ✅ Router & HTTP
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(), 
    // ✅ Toastr + Animations (Required for ngx-toastr)
    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        timeOut: 3000,
        progressBar: true,
        closeButton: true,
        preventDuplicates: true,
      })
    ),
  ],
};
