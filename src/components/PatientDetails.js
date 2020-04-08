import React from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import SignalPlotter from './SignalPlotter';

export default class PatientDetails extends React.Component {
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
  componentDidMount(){
    //const { ecg_ids } = this.props.location.state
    const ecg_ids = this.props.ecg_ids
    this.setState({ecg_ids: ecg_ids});
    //const response = await axios.get("http://localhost:3000/patients/patient/ecg/record/"+ecg_id)
    //console.log(response.data)
    //this.setState({samples: response.data.record[0].samples});

  }

  render(){

    return(

       <div className="ecgIds">
          {this.state.ecg_ids &&
            this.state.ecg_ids.map((ecgId, index) => {


              return (
                <div className="ecgId" key={index}>

                  <SignalPlotter ecg_id={ecgId}/>

                </div>
              );
            })}

        </div>

    )
  }
}
