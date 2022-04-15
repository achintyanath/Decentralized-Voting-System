import React from 'react'
import './index.css'
export default function Status (props) {
  return (
    <React.Fragment>
      <div className='container-main'>
        <h3>Current status of election</h3>
        <div className='election-status'>
          <p>Started : {props.elStarted ? 'Yes' : 'No'}</p>
          <p>Ended : {props.elEnded ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </React.Fragment>
  )
}
