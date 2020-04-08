import React from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
var noble = require('noble');

export default class RealTimePlotter extends React.Component {
  constructor(props) {
      super(props);

      this.onHeartRateChanged = this.onHeartRateChanged.bind(this);
      this.handleBodySensorLocationCharacteristic = this.handleBodySensorLocationCharacteristic.bind(this);
      this.handleHeartRateMeasurementCharacteristic = this.handleHeartRateMeasurementCharacteristic.bind(this);
      this.parseHeartRate = this.parseHeartRate.bind(this);


      this.state = {hr: ''};
  }

  componentDidMount(){
  }

  componentWillUnmount(){
  }
  //
   parseHeartRate(data) {
    const flags = data.getUint8(0);
    const rate16Bits = flags & 0x1;
    const result = {};
    let index = 1;
    if (rate16Bits) {
      result.heartRate = data.getUint16(index, /*littleEndian=*/true);
      index += 2;
    } else {
      result.heartRate = data.getUint8(index);
      index += 1;
    }

    const contactDetected = flags & 0x2;
    const contactSensorPresent = flags & 0x4;
    if (contactSensorPresent) {
      result.contactDetected = !!contactDetected;
    }
    const energyPresent = flags & 0x8;
    if (energyPresent) {
      result.energyExpended = data.getUint16(index, /*littleEndian=*/true);
      index += 2;
    }
    const rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
      const rrIntervals = [];
      for (; index + 1 < data.byteLength; index += 2) {
        rrIntervals.push(data.getUint16(index, /*littleEndian=*/true));
      }
      result.rrIntervals = rrIntervals;
    }
    return result;
  }
  //
   onHeartRateChanged(event) {
    const characteristic = event.target;
    const bpm = this.parseHeartRate(characteristic.value)
    //console.log(this.parseHeartRate(characteristic.value));
    this.setState({hr: bpm.heartRate})
    console.log("BPM: "+ bpm.heartRate)
}
  //
   handleHeartRateMeasurementCharacteristic(characteristic) {
    return characteristic.startNotifications()
    .then(char => {
      characteristic.addEventListener('characteristicvaluechanged',
                                      this.onHeartRateChanged);
    });
  }
  //
   handleBodySensorLocationCharacteristic(characteristic) {
    if (characteristic === null) {
      console.log("Unknown sensor location.");
      return Promise.resolve();
    }
    return characteristic.readValue()
    .then(sensorLocationData => {
      const sensorLocation = sensorLocationData.getUint8(0);
      switch (sensorLocation) {
        case 0: return 'Other';
        case 1: return 'Chest';
        case 2: return 'Wrist';
        case 3: return 'Finger';
        case 4: return 'Hand';
        case 5: return 'Ear Lobe';
        case 6: return 'Foot';
        default: return 'Unknown';
      }
    }).then(location => console.log(location));
  }
  //

  render(){
    //console.log(navigator)





    //
    navigator.bluetooth.requestDevice({
      filters: [{
        services: ['heart_rate'],
      }]
    }).then(device => device.gatt.connect())
  .then(server => server.getPrimaryService('heart_rate'))
  .then(service => {
    const chosenHeartRateService = service;
    return Promise.all([
      service.getCharacteristic('body_sensor_location')
        .then(this.handleBodySensorLocationCharacteristic),
      service.getCharacteristic('heart_rate_measurement')
        .then(this.handleHeartRateMeasurementCharacteristic),
    ]);
  });

    return(
      <div>
        <p>Here</p>

        <p>{navigator.platform}</p>
        <p>{this.state.hr}</p>
      </div>
    )
  }

}
