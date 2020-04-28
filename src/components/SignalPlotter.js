import React from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import { Form, Button, Icon, Message, Grid, Dropdown,Header, List } from 'semantic-ui-react';

export default class SignalPlotter extends React.Component {
  constructor(props) {
      super(props);
      this.cropSignals = this.cropSignals.bind(this)
      const context = this;
      this.crop_min = 0;
      this.crop_max = 0;
      this.state = {ecg_id: '',
                    email:'',
                    name:'',
                    samples:[],
                    sample_rate:0,
                    duration:0,
                    timestamp:'',
                    r_peaks:[],
                    avg_ht:0,
                    crop_selected:false,
                    options: {

                      chart: {
                                type: 'spline',
                                zoomType: 'x',
                                events: {
                                  selection: function(event) {
                                                  if (event.xAxis){
                                                      console.log("Max X axis:"+ event.xAxis[0].max)
                                                      console.log("Min X axis:"+ event.xAxis[0].min)
                                                      context.crop_min = event.xAxis[0].min
                                                      context.crop_max = event.xAxis[0].max
                                                      console.log(event)
                                                      context.setState({crop_selected: true})
                                                      const chart = this
                                                      //chart.series[0].setData([],true,false)
                                                      //console.log(context.refs.chart.chart.zoomOut)




                                                  }else{
                                                    // Reset zoom button was pressed TODO: could this be fired by another event
                                                    context.setState({crop_selected: false})
                                                  }

                                              }
                                }
                            },
                      title: {
                        text: this.props.ecgId
                      },
                      series: [
                        {
                          data: []
                        }
                      ],
                      yAxis: {
                        title: {
                            text: 'ECG (mV)'
                        }
                      },
                      xAxis: {
                        title: {
                            text: 'time (ms)'
                        }
                      }
                    }

        };

  }

  async componentDidMount(){
    //const { ecg_id } = this.props.location.state
    const ecg_id = this.props.ecg_id
    this.setState({ecg_id: ecg_id});
    const response = await axios.get("http://localhost:3000/patients/patient/ecg/record/"+ecg_id)
    //console.log(response.data)
    try{
      this.setState({samples: response.data.record[0].samples,
                     sample_rate: response.data.record[0].sample_rate,
                     duration: response.data.record[0].duration,
                     timestamp: response.data.record[0].timestamp,
                     r_peaks: response.data.record[0].r_peaks,
                     avg_ht: response.data.record[0].avg_ht,
                     options:{
                       series:[
                         {
                          name:'ECG', //TODO dynamic
                           data:response.data.record[0].samples
                         }
                       ]
                     }

      });
    }catch(e){
      console.log('Error fetching signal')
    }
    //this.refs.chart.chart.series[0].setData(response.data.record[0].samples)

  }

  cropSignals(){
    this.refs.chart.chart.zoomOut()
    this.refs.chart.chart.series[0].setData(this.state.samples.slice(this.crop_min,this.crop_max),true,false)
    this.setState({crop_selected: false})
    // TODO: reset this.state.samples
    // Ask and upload/replace signal in db

  }

  render(){


    return(
      <div>
      <List horizontal>
        <List.Item>
          <List.Content>
            <List.Header>Signal Type</List.Header>
          {this.state.options.series[0].name}
          </List.Content>
        </List.Item>

        <List.Item>
          <List.Content>
            <List.Header>Duration</List.Header>
          {this.state.duration}
          </List.Content>
        </List.Item>

        <List.Item>
          <List.Content>
            <List.Header>Heart Rate</List.Header>
          {this.state.avg_ht}
          </List.Content>
        </List.Item>
      </List>
      <div>
      </div>
      {this.state.crop_selected &&
        <Button onClick={this.cropSignals}>
        Crop
        </Button>}

        <HighchartsReact
          highcharts={Highcharts}
          options={this.state.options}
          ref='chart'
        />
      </div>

    )
  }


}
