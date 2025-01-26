import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MqttService, IMqttServiceOptions } from 'ngx-mqtt';


// const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
//   hostname: 'localhost',  // Adres brokera MQTT
//   port: 1883,                      // Port WebSocket (domyślnie 1883 dla TCP)
//   path: '/mqtt',                    // Ścieżka do WebSocket
//   protocol: 'ws',                    // 'ws' lub 'wss' dla zabezpieczonego połączenia
// };


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule],
  providers: [
    {
      provide: MqttService
    },
  ]
})
export class AppComponent {
  title = 'Project';
}
