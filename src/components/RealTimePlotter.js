import React from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
//var noble = require('noble');
//var Bluetooth	= require('node-web-bluetooth');

export default class RealTimePlotter extends React.Component {
  constructor(props) {
      super(props);
      this.state = {hr: '',device:'',byte1:'',byte2:'',options:'',data:[]};
  }

  async componentDidMount(){
    //console.log("BLUETOOTH: "+Bluetooth)
    let device = await navigator.bluetooth.requestDevice({
      filters: [
          { namePrefix: 'MAX' }
      ],
      optionalServices: [ ]
    });
    let server = await device.gatt.connect();
    let service = await server.getPrimaryService(0x180D);
    let characteristic = await service.getCharacteristic(0x2A37);
    characteristic.addEventListener(
      'characteristicvaluechanged', e => {
          let byte1 = e.target.value.getUint8(0);
          let byte2 = e.target.value.getUint8(1);

          console.log(e.target.value.getUint16(0,true))

          let d = this.state.data
          if (d.length==2000){d.shift()}
          d.push(byte2)

          this.setState({hr:byte2, byte1: byte1, byte2:byte2,data:d});


    }
);

characteristic.startNotifications();
  }

  componentWillUnmount(){
  }


  render(){
    //console.log(navigator)
    //

    let options = {
      title: {
        text: "HR"
      },
      series: [
        {
          data: this.state.data
        }
      ],
      yAxis: {
        title: {
            text: 'HR (bpm)'
        }
      },
      xAxis: {
        title: {
            text: 'time (ms)'
        }
      }
    };

    return(
      <div>
        <p>Here</p>

        <p>{navigator.platform}</p>
        <p>{this.state.byte1}, {this.state.byte2}</p>

        <HighchartsReact
          highcharts={Highcharts}

          options={options}
        />
      </div>
    )
  }

}
