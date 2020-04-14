import React from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';

export default class SignalPlotter extends React.Component {
  constructor(props) {
      super(props);

      console.log(props)
      this.state = {ecg_id: '',
                    email:'',
                    name:'',
                    samples:[],
                    sample_rate:0,
                    duration:0,
                    timestamp:'',
                    r_peaks:[],
                    avg_ht:0,
                    options: {

                      chart: {
                                zoomType: 'xy'
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
    console.log(response.data)
    this.setState({samples: response.data.record[0].samples,
                   sample_rate: response.data.record[0].sample_rate,
                   duration: response.data.record[0].duration,
                   timestamp: response.data.record[0].timestamp,
                   r_peaks: response.data.record[0].r_peaks,
                   avg_ht: response.data.record[0].avg_ht,
                   options:{
                     series:[
                       {
                         data:response.data.record[0].samples
                       }
                     ]
                   }

    });
    //this.refs.chart.chart.series[0].setData(response.data.record[0].samples)

  }

  render(){


    return(
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          options={this.state.options}
          ref='chart'
        />
      </div>

    )
  }


}
