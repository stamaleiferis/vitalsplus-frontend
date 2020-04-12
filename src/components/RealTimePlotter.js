import React from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
//var noble = require('noble');
//var Bluetooth	= require('node-web-bluetooth');
import { ecg_samples } from '../ecgValues.js'

export default class RealTimePlotter extends React.Component {
  constructor(props) {
      super(props);
      this.toggleEcgNotifications = this.toggleEcgNotifications.bind(this);
      this.resetStream = this.resetStream.bind(this);
      let context = this;
      this.state = {hr: '',
                    device:'',
                    ecg_data:[],
                    ppg_red_data:[],
                    ppg_ir_data:[],
                    ecg_count:0,
                    ppg_red_count:0,
                    ppg_ir_count:0,
                    _ecgchar:'',
                    _ppgredchar:'',
                    _ppgirchar:'',
                    options: {
                      chart: {
                              zoomType: 'x',
                            },
                      title: {
                        text: "Signal TODO"
                      },
                      series: [
                        {
                          data: []
                        },
                        {
                          data:[]
                        },
                        {
                          data:[]
                        }
                      ],
                      yAxis: {
                        title: {
                            text: 'y value'
                        }

                      },
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
          let d = this.state.ppg_red_data; //get array of stored values
          let count = this.state.ppg_red_count; //number of samples in the array
          if (count>500){d.shift()} // how many samples to hold at a time TODO change
          d.push(uint32ppgred)

          if ((count%10)==0){
            this.setState({
              options: {
                series: [
                  {data:this.state.ecg_data},{data:d},{ data: this.state.ppg_ir_data}
                ]
              }
            });
          }
          this.setState({hr:0/*TODO*/,ppg_red_data:d,ppg_red_count:count+1});
      }
    );

    // on infrared ppg char change
    ppgIrCharacteristic.addEventListener(
      'characteristicvaluechanged', e => {
          //console.log("PPG IR val changed")
          let uint32ppgir = e.target.value.getUint32(0,true); //get value
          let d = this.state.ppg_ir_data; //get array of stored values
          let count = this.state.ppg_ir_count; //number of samples in the array
          if (count>500){d.shift()} // how many samples to hold at a time TODO change
          d.push(uint32ppgir)

          if ((count%10)==0){
            this.setState({
              options: {
                series: [
                  {data:this.state.ecg_data},{data:this.state.ppg_red_data},{ data: d}
                ]
              }
            });
          }
          this.setState({ppg_ir_data:d,ppg_ir_count:count+1});
      }
    );

    // on ecg char change
    ecgCharacteristic.addEventListener(
      'characteristicvaluechanged', e => {
          //console.log("ECG val changed")
          let int16ecg = e.target.value.getInt16(0,true); //get value
          let d = this.state.ecg_data; //get array of stored values
          let count = this.state.ecg_count; //number of samples in the array
          if (count>500){d.shift()} // how many samples to hold at a time TODO change
          d.push(int16ecg)
          //this.refs.chart.chart.series[0].xData.push(count)
          //this.refs.chart.chart.series[0].yData.push(int16ecg)
          //console.log(this.refs.chart.chart)


          if ((count%10)==0){
            this.setState({
              options: {
                series:[
                  { data: d}, {data:this.state.ppg_red_data},{data:this.state.ppg_ir_data}

                ]
              }
            });
          }
          this.setState({hr:0/*TODO*/,ecg_data:d,ecg_count:count+1});
      }
    );

    this.setState({_ecgchar:ecgCharacteristic, _ppgredchar:ppgRedCharacteristic, _ppgirchar: ppgIrCharacteristic})
    ecgCharacteristic.startNotifications();
    ppgRedCharacteristic.startNotifications();
    ppgIrCharacteristic.startNotifications();
  }// end componentDidMount

  async componentWillUnmount(){
    this.state._ecgchar.stopNotifications();
    this.state._ppgredchar.stopNotifications();
    this.state._ppgirchar.stopNotifications();
  }
  componentDidUpdate(prevProps, prevState, snapshot){
    //console.log("componentDidUpdate")
  }

  toggleEcgNotifications(){
    this.state._ecgchar.stopNotifications();
    console.log(JSON.stringify(this.state.data));
  }

  resetStream(){
    //this.setState({data:[]})
    this.refs.chart.chart.series[0].addPoint([5,5],true,true)
  }




  render(){



    return(
      <div>
        <p>Here</p>

        <p>{navigator.platform}</p>
        <p>{this.state.ecg_val}</p>
        <div>
          <button onClick={this.toggleEcgNotifications}>
            Unsubscribe notifications
          </button>
          <button onClick={this.resetStream}>
            Reset stream
          </button>
        </div>

        <HighchartsReact
          highcharts={Highcharts}
          options={this.state.options}
          ref="chart"
        />
      </div>
    )
  }

}
