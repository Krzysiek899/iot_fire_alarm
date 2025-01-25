import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Dodanie obsługi routingu
    provideHttpClient(),    // Dodanie obsługi HTTP
    importProvidersFrom()
  ]
}).catch(err => console.error('Błąd podczas uruchamiania aplikacji:', err));
