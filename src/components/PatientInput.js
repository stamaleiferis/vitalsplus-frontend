import axios from 'axios';
import  React, { useState } from 'react';
import SignalPlotter from './SignalPlotter';
import PatientDetails from './PatientDetails';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


export default class PatientInput extends React.Component {
  constructor(props) {
      super(props);

      //const [users, setUsers] = useState(null);
      //const [ecgIds, setEcgIds] = useState(null);

      //this.apiURL = ;
      this.fetchEcgIds = this.fetchEcgIds.bind(this);
      this.handleChange = this.handleChange.bind(this)

      this.state = {patient_id: '5e8c2c92166b290827169a74',email:'',name:'',ecgIds:[]};
      //this.ecgIds = []
    }

    async fetchEcgIds() {
        //console.log("patientID:" + this.state.patient_id)
        const response = await axios.get("http://www.localhost:3000/patients/patient/ecg/ids/"+this.state.patient_id)
        console.log("Response"+response.data.record)
        //setEcgIds(response.data.record[0].ecg_id)
        //this.state.ecgIds = response.data.record[0].ecg_id
        this.setState({ecgIds: response.data.record[0].ecg_id})
    }

    handleChange(event) {
      console.log("[Handle change]:"+event.target.value)
      //console.log(this.getState())
     this.setState({patient_id: event.target.value});
  }

  render() {
    return (
      <div>

          <form>
            <label>
            Patient ID:
            <input type="text" name="patient_id" value={this.state.patient_id} onChange={this.handleChange}/>
            </label>

          </form>
          <div>
            <button className="fetch-button" onClick={this.fetchEcgIds}>
              Fetch Data
            </button>
          </div>
          {this.state.ecgIds.length>0 && <PatientDetails ecg_ids={this.state.ecgIds}/>}

      </div>
    );
  }
}
