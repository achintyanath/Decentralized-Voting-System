
import React, { useEffect, useState } from 'react'

import Navbar from '../../Navbar/Navigation'
import NavbarAdmin from '../../Navbar/NavigationAdmin'
import getWeb3 from '../../../getWeb3'
import Election from '../../../contracts/Election.json'
import { Circles } from 'react-loading-icons'
import AdminOnly from '../../AdminOnly'
import './index.css'

export function loadAdded (candidates) {
  console.log(candidates)
  const renderAdded = candidate => {
    return (
      <>
        <div className='container-list success'>
          <div
            style={{
              maxHeight: '21px',
              overflow: 'auto'
            }}
          >
            {candidate.id}. <strong>{candidate.header}</strong>:{' '}
            {candidate.slogan}
          </div>
        </div>
      </>
    )
  }
  return (
    <div className='container-main' style={{ borderTop: '1px solid' }}>
      <div className='container-item info'>
        <center>Candidates List</center>
      </div>
      {candidates.length < 1 ? (
        <div className='container-item alert'>
          <center>No candidates added.</center>
        </div>
      ) : (
        <div
          className='container-item'
          style={{
            display: 'block',
            backgroundColor: '#DDFFFF'
          }}
        >
          {candidates.map((renderAdded))}
        </div>
      )}
    </div>
  )
}

export default function AddCandidate () {
  const [electionInstance, setElectionInstance] = useState()
  const [web3, setweb3] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [admin, setAdmin] = useState(false)
  const [candidateName, setCandidateName] = useState('')
  const [candidateSlogan, setcandidateSlogan] = useState('')
  const [candidate, setCandidate] = useState([])
  const [Noofcandidate, setNoofCandidate] = useState(undefined)
  
  async function load () {
    try {
    if (!window.location.hash) {
      window.location = window.location + '#loaded'
      window.location.reload()
    }

    const web3_instance = await getWeb3()
    setweb3(web3_instance)
    const cliaccounts = await web3_instance.eth.getAccounts()
    setAccounts(cliaccounts[0])
    const networkId = await web3_instance.eth.net.getId()
    const deployedNetwork = Election.networks[networkId]
    const instance = new web3_instance.eth.Contract(
      Election.abi,
      deployedNetwork && deployedNetwork.address
    )
    setElectionInstance(instance)
    const candidateCount = await instance.methods.getTotalCandidate().call()
    setNoofCandidate(candidateCount)
    const isAdmin = await instance.methods.getAdmin().call()
    if (cliaccounts[0] === isAdmin) {
      setAdmin(true)
    }
    var candidateArray = []
    let i = 0
    while (i < candidateCount) {
      const currentCandidate = await instance.methods.candidateDetails(i).call()
      console.log(currentCandidate)
      candidateArray.push({
        id: currentCandidate.candidateId,
        header: currentCandidate.header,
        slogan: currentCandidate.slogan
      })
      i++;
    }
    console.log(candidateArray)
    setCandidate(candidateArray)
    }
    catch (error) {
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
    }
  }

  useEffect(() => {
    load()
  }, [])

 function updateName (event) {
    setCandidateName(event.target.value)
  }
function updateSlogan (event) {
    setcandidateSlogan(event.target.value)
  }

  async function handleSubmit (event) {
    await electionInstance.methods.addCandidate(candidateName, candidateSlogan)
      .send({ from: accounts, gas: 1000000 });
    window.location.reload()
  }

  // render() {
  //   if (!this.state.web3) {
  //     return (
  //       <>
  //         {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
  //         <center>Loading Web3, accounts, and contract...</center>
  //       </>
  //     );
  //   }
  //   if (!this.state.isAdmin) {
  //     return (
  //       <>
  //         <Navbar />
  //         <AdminOnly page="Add Candidate Page." />
  //       </>
  //     );
  //   }
  //   return (
  //     <>
  //       <NavbarAdmin />
  //       <div className="container-main">
  //         <h2>Add a new candidate</h2>
  //         <small>Total candidates: {this.state.candidateCount}</small>
  //         <div className="container-item">
  //           <form className="form">
  //             <label className={"label-ac"}>
  //               Header
  //               <input
  //                 className={"input-ac"}
  //                 type="text"
  //                 placeholder="eg. Marcus"
  //                 value={this.state.header}
  //                 onChange={this.updateHeader}
  //               />
  //             </label>
  //             <label className={"label-ac"}>
  //               Slogan
  //               <input
  //                 className={"input-ac"}
  //                 type="text"
  //                 placeholder="eg. It is what it is"
  //                 value={this.state.slogan}
  //                 onChange={this.updateSlogan}
  //               />
  //             </label>
  //             <button
  //               className="btn-add"
  //               disabled={
  //                 this.state.header.length < 3 || this.state.header.length > 21
  //               }
  //               onClick={this.addCandidate}
  //             >
  //               Add
  //             </button>
  //           </form>
  //         </div>
  //       </div>
  //       {loadAdded(this.state.candidates)}
  //     </>
  //   );
  // }
  if (web3 == null) {
    return (
      <React.Fragment>
        {admin ? <NavbarAdmin /> : <Navbar />}
        <div display='flex' align-items='center'>
          <Circles />
        </div>
      </React.Fragment>
    )
  } else if (!admin) {
    return (
      <React.Fragment>
        <Navbar />
        <AdminOnly page='Add Candidate Page.' />
      </React.Fragment>
    )
  } else {
    return(
    <React.Fragment>
      <NavbarAdmin />
      <div className='container-main'>
        <h2>Register a New Candidate</h2>
        <small>Total registered candidates: {Noofcandidate}</small>
        <div className='container-item'>
          <form className='form'>
            <label className={'label-ac'}>
              Candidate Name
              <input
                className={'input-ac'}
                type='text'
                placeholder='Joe Biden'
                value={candidateName}
                onChange={updateName}
              />
            </label>
            <label className={'label-ac'}>
              Slogan
              <input
                className={'input-ac'}
                type='text'
                placeholder='Make America Great Again'
                value={candidateSlogan}
                onChange={updateSlogan}
              />
            </label>
            <button
              className='btn-add'
              // disabled={
              //   candidateName===undefined || candidateName.length=== 0||candidateSlogan===undefined || candidateSlogan.length=== 0
              // }
              onClick={handleSubmit}
            >
              Add
            </button>
          </form>
        </div>
      </div>
      {loadAdded(candidate)}
    </React.Fragment>
    )
  }
    
}
