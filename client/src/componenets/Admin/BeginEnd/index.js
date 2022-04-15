import React from 'react'
import { Link } from 'react-router-dom'
import './index.css'

export default function BeginEnd (props) {
  if (!props.elStarted && !props.elEnded) {
    return (
      <React.Fragment>
        <div className='container-main'>
          <div
            className='container-item add-candidate'
            style={{ display: 'block' }}
          >
            <h2>Add Candidates to the election</h2>
            <p>
              Go to{' '}
              <Link
                title='Add a new '
                to='/addCandidate'
                style={{
                  color: 'black',
                  textDecoration: 'underline'
                }}
              >
                Add Candidates
              </Link>{' '}
              page.
            </p>
          </div>
          <div className='container-item'>
            <button type='submit' className='button'>
              Start Election
            </button>
          </div>
        </div>
      </React.Fragment>
    )
  }
  else if (!props.elStarted && props.elEnded) {
    return (
      <React.Fragment>
        <div className='container-main'>
          <div className='container-item'>
            The election has been condicted successfully. The result can be
            found in the result tab.
          </div>
        </div>
      </React.Fragment>
    )
  }
  else {
    return (
      <React.Fragment>
        <div className='container-main'>
          <div className='container-item'>
            <div className='center'>The election has been started.</div>
          </div>
          <div className='container-item'>
            <button type='button' className='button' onClick={props.endElFn}>
              End Election
            </button>
          </div>
        </div>
      </React.Fragment>
    )
  }
}
