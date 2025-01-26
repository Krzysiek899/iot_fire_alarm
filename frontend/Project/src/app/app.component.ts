import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MqttModule } from 'ngx-mqtt';
import { MQTT_SERVICE_OPTIONS } from './mqtt-config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule],
})
export class AppComponent {
  title = 'Project';
}
