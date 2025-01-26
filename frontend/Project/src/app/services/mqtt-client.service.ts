import { Injectable } from '@angular/core';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Observable, merge, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MqttSensorService {
    constructor(private mqttService: MqttService) {}

    /**
     * Subskrybuje tematy powiązane z danym topikiem.
     * @param topic Podstawowy temat MQTT
     * @returns Observable z odczytami sensorów i alarmami
     */
    subscribeToTopic(topic: string): Observable<{ type: string; value: any }> {
        const temperature$ = this.mqttService.observe(`${topic}/sensors/temperature`).pipe(
            map((message: IMqttMessage) => ({ type: 'temperature', value: message.payload.toString() }))
        );

        const pressure$ = this.mqttService.observe(`${topic}/sensors/pressure`).pipe(
            map((message: IMqttMessage) => ({ type: 'pressure', value: message.payload.toString() }))
        );

        const smoke$ = this.mqttService.observe(`${topic}/sensors/smoke`).pipe(
            map((message: IMqttMessage) => ({ type: 'smoke', value: message.payload.toString() }))
        );

        const alarms$ = this.mqttService.observe(`${topic}/alarms`).pipe(
            map((message: IMqttMessage) => ({ type: 'alarm', value: message.payload.toString() }))
        );

        // Łączenie wszystkich strumieni w jeden Observable
        return merge(temperature$, pressure$, smoke$, alarms$);
    }
}
