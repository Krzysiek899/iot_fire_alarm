import { TestBed } from '@angular/core/testing';

import { MqttSensorService } from './mqtt-client.service';

describe('MqttClientService', () => {
  let service: MqttSensorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MqttSensorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
