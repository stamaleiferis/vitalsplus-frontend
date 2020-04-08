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
                    avg_ht:0

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

    });
  }

  render(){

    const options = {
      title: {
        text: this.state.ecg_id
      },
      series: [
        {
          data: this.state.samples
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
    };

    return(
      <div>
        <HighchartsReact
          highcharts={Highcharts}

          options={options}
        />
      </div>

    )
  }


}
