import React from 'react'
import Navbar from '../Navbar/Navigation'
import NavbarAdmin from '../Navbar/NavigationAdmin'
import { Circles } from 'react-loading-icons'


export default function Loading(props){
  return (
    <React.Fragment>
      {props.admin ? <NavbarAdmin /> : <Navbar />}
      <div style ={{'text-align': 'center'}}
      >
       <h2> Loading Web3 instance........ </h2>
       <Circles />
      </div>
    </React.Fragment>
  )
}