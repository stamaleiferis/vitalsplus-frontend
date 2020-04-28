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
import { Form, Button, Icon, Message, Grid, Dropdown,Header, List } from 'semantic-ui-react';


export default class PatientInput extends React.Component {
  constructor(props) {
      super(props);

      //const [users, setUsers] = useState(null);
      //const [ecgIds, setEcgIds] = useState(null);

      //this.apiURL = ;
      this.handleSubmit = this.handleSubmit.bind(this);
      this.fetchEcgIds = this.fetchEcgIds.bind(this);
      this.handleChange = this.handleChange.bind(this)

      this.state = {patient_id: 'saleiferis@gmail.com',email:'',name:'Stamatis',ecgIds:[]};
      //this.ecgIds = []
    }

  async fetchEcgIds() {
        //console.log("patientID:" + this.state.patient_id)
      try{
          const response = await axios.get("http://www.localhost:3000/patients/patient/ecg/ids/"+this.state.patient_id)
          console.log("Response"+response.data.record)
          //setEcgIds(response.data.record[0].ecg_id)
          //this.state.ecgIds = response.data.record[0].ecg_id
          this.setState({ecgIds: response.data.record[0].ecg_id})
      }catch(e){
        console.log("Error "+ e)
      }
    }

  async handleChange(event) {
     //console.log("[Handle change]:"+event.target.value)

     //console.log(this.getState())
     //const patient_id = event.target.value
     //console.log(patient_id)
     this.setState({patient_id: event.target.value});
     /*
     if (patient_id){
       try{
         //console.log("PatientID: "+this.state.patient_id)
         const response = await axios.get("http://www.localhost:3000/patients/patient/ecg/ids/"+patient_id)
         //console.log("http://www.localhost:3000/patients/patient/ecg/ids/"+patient_id)
         //console.log("RESPONSE: "+response.data.record)
         this.setState({ecgIds: response.data.record[0].ecg_id})
         //console.log("Got signals")
       }catch(e){
         //console.log("Error" +e)
       }
     }else{

     }*/
  }

  async handleSubmit(){
    if (this.state.patient_id){
      try{
        //console.log("PatientID: "+this.state.patient_id)
        const response = await axios.get("http://www.localhost:3000/patients/patient/ecg/ids/"+this.state.patient_id)
        //console.log("http://www.localhost:3000/patients/patient/ecg/ids/"+patient_id)
        //console.log("RESPONSE: "+response.data.record)
        this.setState({ecgIds: response.data.record[0].ecg_id})
        //console.log("Got signals")
      }catch(e){
        //console.log("Error" +e)
      }
    }else{

    }

  }

  render() {
    return (
      <div>

        <Form onSubmit={this.handleSubmit}>
           <Form.Input label='PatientID' placeholder='Enter email for now' />
           <Button onClick={this.fetchEcgIds}>Submit</Button>
        </Form>
        {this.state.ecgIds.length>0 && <PatientDetails ecg_ids={this.state.ecgIds}/>}

      </div>
    );
  }
}
