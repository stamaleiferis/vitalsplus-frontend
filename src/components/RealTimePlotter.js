import React from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
//var noble = require('noble');
//var Bluetooth	= require('node-web-bluetooth');
import { ecg_samples } from '../ecgValues.js'

export default class RealTimePlotter extends React.Component {
  constructor(props) {
      super(props);
      this.connectBT = this.connectBT.bind(this);
      this.disconnectBT = this.disconnectBT.bind(this);
      this.togglePpgRedNotifications = this.togglePpgRedNotifications.bind(this);
      this.togglePpgIrNotifications = this.togglePpgIrNotifications.bind(this);
      this.toggleEcgNotifications = this.toggleEcgNotifications.bind(this);
      this.toggleAllNotifications = this.toggleAllNotifications.bind(this);
      this.resetStream = this.resetStream.bind(this);

      this.ecg_data = [];
      this.ppg_red_data = [];
      this.ppg_ir_data = [];
      this.hr_data = [];
      this.ecg_count = 0
      this.ppg_red_count = 0
      this.ppg_ir_count = 0
      this._ecgon = false
      this._ppgredon = false
      this._ppgiron = false
      this.device = ''
      this._ecgchar = ''
      this._ppgredchar = ''
      this._ppgirchar = ''

      this.state = {
                    options: {
                      boost: {
                        enabled: true
                      },
                      chart: {
                              type:'spline',
                              zoomType: 'x',
                            },
                      title: {
                        text: ""
                      },
                      series: {
                          boostThreshold: 50
                      },
                      series: [
                        {
                          name:"ECG",
                          data: [],
                          yAxis: 0
                        },
                        {
                          name: "PPG Red",
                          data:[],
                          yAxis:1
                        },
                        {
                          name: "PPG Infrared",
                          data:[],
                          yAxis:2
                        }
                      ],
                      yAxis: [{ // Primary yAxis
                        labels: {
                            format: '{value}mV',
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                        title: {
                            text: 'Millivolts',
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                        opposite: true

                      },
                       { // Secondary yAxis
                        gridLineWidth: 0,
                        title: {
                            text: 'Photon Count Red',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        labels: {
                            format: '{value} SpO2',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        }
                      },
                      { // Third yAxis
                       gridLineWidth: 0,
                       title: {
                           text: 'Photon Count IR',
                           style: {
                               color: Highcharts.getOptions().colors[0]
                           }
                       },
                       labels: {
                           format: '{value} SpO2',
                           style: {
                               color: Highcharts.getOptions().colors[0]
                           }
                       }
                     }
                    ],

                      xAxis: {
                        title: {
                            text: 'time (ms)'
                        }
                      }
                    }//end options
                    };
  }



  async componentDidMount(){
    //console.log("IN componentDidMount()")


  }// end componentDidMount

  async componentWillUnmount(){
    if (this.device !=''){
      await this.device.gatt.disconnect();
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot){
    //console.log("componentDidUpdate")
  }

  toggleEcgNotifications(){
    if (this._ecgon){this._ecgchar.stopNotifications()}
    else {this._ecgchar.startNotifications()}
    this._ecgon = !this._ecgon

  }

  togglePpgRedNotifications(){
    if (this._ppgredon){this._ppgredchar.stopNotifications()}
    else {this._ppgredchar.startNotifications()}
    this._ppgredon = !this._ppgredon
  }
  togglePpgIrNotifications(){
    if (this._ppgiron){this._ppgirchar.stopNotifications()}
    else {this._ppgirchar.startNotifications()}
    this._ppgiron = !this._ppgiron

  }
  toggleAllNotifications(){ //TODO fix this for on/off
    this._ecgchar.stopNotifications();
    this._ppgredchar.stopNotifications();
    this._ppgirchar.stopNotifications();
  }

  async resetStream(){
    await this._ecgchar.stopNotifications();
    await this._ppgredchar.stopNotifications();
    await this._ppgirchar.stopNotifications();
    this.ecg_data = []
    this.ppg_red_data = []
    this.ppg_ir_data = []
    this.refs.chart.chart.series[0].setData(this.ecg_data)
    this.refs.chart.chart.series[1].setData(this.ppg_red_data)
    this.refs.chart.chart.series[2].setData(this.ppg_ir_data)
    await this._ecgchar.startNotifications();
    await this._ppgredchar.startNotifications();
    await this._ppgirchar.startNotifications();

    //this.setState({data:[]})

  }

  async connectBT(){
    const ECG_SERV_UUID = 'e51b251d-b5bb-47cd-8f0b-176d7004563c'
    const ECG_CHAR_UUID = 'e51b251d-b5bb-47ce-8f0b-176d7004563c'
    const PPG_SERV_UUID = 'e14c6c9d-3497-4835-8f8b-28d7af2e6a15'
    const PPG_RED_CHAR_UUID = 'e14c6c9d-3497-4836-8f8b-28d7af2e6a15'
    const PPG_IR_CHAR_UUID = 'e14c6c9d-3497-4837-8f8b-28d7af2e6a15'
    const HR_SERV_UUID = 0x180D;
    const HR_CHAR_BPM_UUID = 0x2A37;

    let device = await navigator.bluetooth.requestDevice({
      filters: [
          { namePrefix: 'MAX' }
      ],
      optionalServices: [PPG_SERV_UUID, ECG_SERV_UUID]
    });
    let server = await device.gatt.connect();

    //let service = await server.getPrimaryService(0x180D); //Heart Rate Service
    //let characteristic = await service.getCharacteristic(0x2A37);  //Heart Rate Characteristic
    const services = await server.getPrimaryServices();
    //console.log(services)
    const ppgService = services[0]
    const ecgService = services[1]
    //console.log(service)
    const ppgRedCharacteristic = await ppgService.getCharacteristic(PPG_RED_CHAR_UUID);
    const ppgIrCharacteristic = await ppgService.getCharacteristic(PPG_IR_CHAR_UUID);
    let ecgCharacteristic = await ecgService.getCharacteristic(ECG_CHAR_UUID);


    // on red ppg char change
    ppgRedCharacteristic.addEventListener(
      'characteristicvaluechanged', e => {
        //console.log("PPG RED val changed")
          let uint32ppgred = e.target.value.getUint32(0,true); //get value
          let count = this.ppg_red_count; //number of samples in the array
          this.ppg_red_data.push(uint32ppgred)
          this.ppg_red_count = count + 1
          this.refs.chart.chart.series[1].setData(this.ppg_red_data)
      }
    );

    // on infrared ppg char change
    ppgIrCharacteristic.addEventListener(
      'characteristicvaluechanged', e => {
          //console.log("PPG IR val changed")
          let uint32ppgir = e.target.value.getUint32(0,true); //get value
          let count = this.ppg_red_count; //number of samples in the array
          this.ppg_ir_data.push(uint32ppgir)
          this.ppg_ir_count = count + 1
          this.refs.chart.chart.series[2].setData(this.ppg_ir_data)
      }
    );

    // on ecg char change
    ecgCharacteristic.addEventListener(
      'characteristicvaluechanged', e => {
          //console.log("ECG val changed")
          let int16ecg = e.target.value.getInt16(0,true); //get value
          let count = this.ecg_count; //number of samples in the array
          //if (count>300){shift=true}//{this.start=this.start+1} // how many samples to hold at a time TODO change
          this.ecg_data.push(int16ecg)
          this.ecg_count = count+1
          this.refs.chart.chart.series[0].setData(this.ecg_data)

      }
    );

    this.device = device
    this._ecgchar = ecgCharacteristic
    this._ppgredchar = ppgRedCharacteristic
    this._ppgirchar = ppgIrCharacteristic
    ecgCharacteristic.startNotifications(); this._ecgon = true;
    //ppgRedCharacteristic.startNotifications(); this._ppgredon = false;
    //ppgIrCharacteristic.startNotifications(); this._ppgiron = false

  }

  async disconnectBT(){
    if (this.device != ''){
      if (this.device.gatt.connected){
        await this.device.gatt.disconnect()
        console.log("Disconnected from peripheral")
      }else{
        console.log("Peripheral already disconnected")
      }
    }
  }




  render(){



    return(
      <div>
        <p>{navigator.platform}</p>

        <div>
        <button onClick={this.connectBT}>
          Connect BT
        </button>

        <button onClick={this.disconnectBT}>
          Disconnect
        </button>

        </div>

        <div>
          <button onClick={this.toggleAllNotifications}>
            Unsubscribe All
          </button>
          <button onClick={this.toggleEcgNotifications}>
            Unsubscribe ECG
          </button>
          <button onClick={this.togglePpgRedNotifications}>
            Unsubscribe PPG Red
          </button>
          <button onClick={this.togglePpgIrNotifications}>
            Unsubscribe PPG Infrared
          </button>
          <button onClick={this.resetStream}>
            Reset stream
          </button>
        </div>

        <HighchartsReact
          highcharts={Highcharts}
          options={this.state.options}
          ref='chart'
        />
      </div>
    )
  }

}
