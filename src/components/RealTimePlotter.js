import React from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
//var noble = require('noble');
//var Bluetooth	= require('node-web-bluetooth');
import { ecg_samples } from '../ecgValues.js'

export default class RealTimePlotter extends React.Component {
  constructor(props) {
      super(props);
      this.togglePpgRedNotifications = this.togglePpgRedNotifications.bind(this);
      this.togglePpgIrNotifications = this.togglePpgIrNotifications.bind(this);
      this.toggleEcgNotifications = this.toggleEcgNotifications.bind(this);
      this.toggleAllNotifications = this.toggleAllNotifications.bind(this);

      this.resetStream = this.resetStream.bind(this);
      let context = this;
      this.ecg_data = [];
      this.ppg_red_data = [];
      this.ppg_ir_data = [];
      this.ecg_count = 0
      this.ppg_red_count = 0
      this.ppg_ir_count = 0
      this.start = 0
      this.state = {hr: '',
                    device:'',
                    _ecgchar:'',
                    _ecgon:false,
                    _ppgredchar:'',
                    _ppgredon:false,
                    _ppgirchar:'',
                    _ppgiron:false,
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

    this.setState({device:device,_ecgchar:ecgCharacteristic, _ppgredchar:ppgRedCharacteristic, _ppgirchar: ppgIrCharacteristic})
    ecgCharacteristic.startNotifications();
    //ppgRedCharacteristic.startNotifications();
    //ppgIrCharacteristic.startNotifications();
  }// end componentDidMount

  async componentWillUnmount(){
    if (this.state._ecgchar != '' && this.state._ppgredchar!='' && this.state._ppgirchar!=''){
      this.state._ecgchar.stopNotifications();
      this.state._ppgredchar.stopNotifications();
      this.state._ppgirchar.stopNotifications();
      await this.state.device.gatt.disconnect();
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot){
    //console.log("componentDidUpdate")
  }

  toggleEcgNotifications(){
    if (this.state._ecgon){this.state._ecgchar.stopNotifications()}
    else {this.state._ecgchar.startNotifications()}
    this.setState({_ecgon:!this.state._ecgon})

    //console.log(JSON.stringify(this.state.data));
  }

  togglePpgRedNotifications(){
    if (this.state._ppgredon){this.state._ppgredchar.stopNotifications()}
    else {this.state._ppgredchar.startNotifications()}
    this.setState({_ppgredon:!this.state._ppgredon})
  }
  togglePpgIrNotifications(){
    if (this.state._ppgiron){this.state._ppgirchar.stopNotifications()}
    else {this.state._ppgirchar.startNotifications()}
    this.setState({_ppgiron:!this.state._ppgiron})

  }
  toggleAllNotifications(){ //TODO fix this for on/off
    this.state._ecgchar.stopNotifications();
    this.state._ppgredchar.stopNotifications();
    this.state._ppgirchar.stopNotifications();
  }

  resetStream(){
    //this.setState({data:[]})

  }




  render(){



    return(
      <div>
        <p>{navigator.platform}</p>

        <div>
        <button onClick={()=>{}}>
          Connect BT
        </button>
        </div>

        <div>
        <button onClick={()=>{}}>
          Same graph/Multiple Graphs
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
