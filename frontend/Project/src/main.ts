import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { MqttService, IMqttServiceOptions, MqttModule} from 'ngx-mqtt';
import {MQTT_SERVICE_OPTIONS} from "./app/mqtt-config";


import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';


export function tokenGetter() {
  return localStorage.getItem('token');
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(MqttModule.forRoot(MQTT_SERVICE_OPTIONS)),
    provideRouter(routes),  // Dodanie obsługi routingu
    provideHttpClient(),    // Dodanie obsługi HTTP
    importProvidersFrom()
  ]
}).catch(err => console.error('Błąd podczas uruchamiania aplikacji:', err));
