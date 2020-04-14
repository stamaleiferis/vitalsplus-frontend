import React from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import { Form, Button, Icon, Message, Grid, Dropdown,Header } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { ecg_samples } from '../ecgValues.js'

export default class RealTimePlotter extends React.Component {
  constructor(props) {
      super(props);
      this.upload_signals = this.upload_signals.bind(this);
      this.connectBT = this.connectBT.bind(this);
      this.disconnectBT = this.disconnectBT.bind(this);
      this.startRecording = this.startRecording.bind(this);
      this.stopRecording = this.stopRecording.bind(this);
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
      this.start_idx = 0
      this.state = {
                    upload_en: false,
                    bt_connected:false,
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
                          boostThreshold: 50,
                          dataGrouping: {
                              enabled: false
                          }
                      },
                      series: [
                        {
                          type:'spline',
                          name:"ECG",
                          data: [],
                          yAxis: 0,
                          //cropThreshold:300
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
                      yAxis: [{ // ECG yAxis
                        labels: {
                            format: '{value}',
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                        //max:100,
                        //min:-100,
                        //endOnTick: false,
                        //startOnTick: false,
                        title: {
                            text: 'ADC value',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        opposite: false

                      },
                       { // PPG Red yAxis
                        visible:false,
                        gridLineWidth: 0,
                        title: {
                            text: 'Photon Count Red',
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                        labels: {
                            format: '{value} SpO2',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        }
                      },
                      { // PPG Infrared yAxis
                       visible:false,
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
                            text: 'Sample'
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
      if (this.device.gatt.connected){
        await this.device.gatt.disconnect()
        this.state.bt_connected = false
      }
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot){
    //console.log("componentDidUpdate")
  }

  // TODO: ppg upload
  async upload_signals(){
    if (this.state.upload_en){
      const patient_id = '5e8c2c92166b290827169a74'
      const data = {
              timestamp:JSON.stringify(new Date(Date.now())),
              duration:'',
              sample_rate:200,
              samples:this.ecg_data,
              r_peaks:[],
              avg_ht:72,
              afib:false
      }
      const response = await axios.post('http://localhost:3000/patients/patient/ecg/record/'+patient_id, data);
      console.log(patient_id)
      //if upload was successfull
      this.setState({upload_en:false})
      //else: popup error message
    }




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
  toggleAllNotifications(){ //TODO keep previous char_on state
    this.togglePpgRedNotifications()
    this.togglePpgIrNotifications()
    this.toggleEcgNotifications()
  }

  async resetStream(){ //TODO: keep previous char_on state
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

    ecgCharacteristic.stopNotifications(); this._ecgon = false;
    ppgRedCharacteristic.stopNotifications(); this._ppgredon = false;
    ppgIrCharacteristic.stopNotifications(); this._ppgiron = false;
    this.device = device
    this._ecgchar = ecgCharacteristic
    this._ppgredchar = ppgRedCharacteristic
    this._ppgirchar = ppgIrCharacteristic
    this.setState({bt_connected:true})


    // on red ppg char change
    ppgRedCharacteristic.addEventListener(
      'characteristicvaluechanged', e => {
        //console.log("PPG RED val changed")
          let uint32ppgred = e.target.value.getUint32(0,true); //get value
          let count = this.ppg_red_count; //number of samples in the array
          this.ppg_red_data.push(uint32ppgred)
          this.ppg_red_count = count + 1
          let shift = false
          let draw = false
          if (count > 700){shift = true}
          if (count%5==0){draw = true}
          this.refs.chart.chart.series[1].addPoint(uint32ppgred, draw, shift,false)

      }
    );

    // on infrared ppg char change
    ppgIrCharacteristic.addEventListener(
      'characteristicvaluechanged', e => {
          //console.log("PPG IR val changed")
          let uint32ppgir = e.target.value.getUint32(0,true); //get value
          let count = this.ppg_red_count; //number of samples in the array
          //this.ppg_ir_data.push(uint32ppgir)
          this.ppg_ir_count = count + 1
          let shift = false
          let draw = false
          if (count > 700){shift = true}
          if (count%5==0){draw = true}
          this.refs.chart.chart.series[2].addPoint(uint32ppgir, draw, shift,false)

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
          let shift = false
          let draw = false
          if (count > 700){shift = true}
          if (count%5==0){draw = true}
          /*
          if (count%5==0){
            this.refs.chart.chart.series[0].setData(this.ecg_data)
          }*/

          this.refs.chart.chart.series[0].addPoint(int16ecg, draw, shift,false)
      }
    );

  }

  startRecording(){
    if (this.state.bt_connected){
      this.refs.chart.chart.series[0].setData([])
      this.refs.chart.chart.series[1].setData([])
      this.refs.chart.chart.series[2].setData([])
      this.refs.chart.chart.redraw(false)
      this.ecg_data = [];     this.ecg_count = 0
      this.ppg_red_data = []; this.ppg_red_count = 0
      this.ppg_ir_data = [];  this.ppg_ir_count = 0

      this._ecgchar.startNotifications(); this._ecgon = true;
      //this._ppgredchar.startNotifications(); this._ppgredon = true;
      //this._ppgirchar.startNotifications(); this._ppgiron = true;
    }
  }

  stopRecording(){
    this._ecgchar.stopNotifications(); this._ecgon = false;
    this._ppgredchar.stopNotifications(); this._ppgredon = false;
    this._ppgirchar.stopNotifications(); this._ppgiron = false;
    this.refs.chart.chart.series[0].setData(this.ecg_data)
    this.setState({upload_en:true})

  }

  async disconnectBT(){
    if (this.device != ''){
      if (this.device.gatt.connected){
        await this.device.gatt.disconnect()
        this.setState({bt_connected:false})
        console.log("Disconnected from peripheral")
      }else{
        console.log("Peripheral already disconnected")
      }
    }
  }




  render(){



    return(
      <div>
        <Header size='huge' textAlign='center'>Record Signals</Header>

        <div>
        <Button.Group>
        <Button.Group>
        <Button color='green' onClick={this.connectBT}>
          Connect BLE
        </Button>
        <Button color='red' onClick={this.disconnectBT}>
          Disconnect
        </Button>
        </Button.Group>

          <Button.Group>
          <Button color='blue' onClick={this.toggleAllNotifications}>
            Toggle All
          </Button>
          <Button onClick={this.toggleEcgNotifications}>
            Toggle ECG
          </Button>
          <Button onClick={this.togglePpgRedNotifications}>
            Toggle PPG Red
          </Button>
          <Button onClick={this.togglePpgIrNotifications}>
            Toggle PPG Infrared
          </Button>
          </Button.Group>
          <Button color='blue' onClick={this.resetStream}>
            Reset stream
          </Button>
          </Button.Group>
          </div>

        {this.state.bt_connected &&
          <>
          <div>Connected</div>
          <Button.Group horizontal labeled icon>
            <Button icon='play' content='Start recording' onClick={this.startRecording}>
            </Button>
            <Button icon='stop' content='Stop recording' onClick={this.stopRecording}>
            </Button>
            {this.state.upload_en &&
              <Button icon='cloud upload' onClick={this.upload_signals}>
              </Button>
            }
          </Button.Group>
          </>

        }




        <HighchartsReact
          highcharts={Highcharts}
          options={this.state.options}
          ref='chart'
        />
      </div>
    )
  }

}
