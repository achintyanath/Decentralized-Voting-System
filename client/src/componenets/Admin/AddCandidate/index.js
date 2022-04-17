import React, { useEffect, useState } from 'react'
import NavbarAdmin from '../../Navbar/NavigationAdmin'
import getWeb3 from '../../../getWeb3'
import Election from '../../../contracts/Election.json'
import AdminOnly from '../OnlyAdmin'
import './index.css'
import Loading from '../../Loading'

const renderAdded = candidate => {
  return (
    <React.Fragment>
      <tr>
        <td> {parseInt(candidate.id) + 1}.</td>
        <td>
          <strong>{candidate.header}</strong>
        </td>
        <td>{candidate.slogan}</td>
      </tr>
    </React.Fragment>
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
        const currentCandidate = await instance.methods
          .candidateDetails(i)
          .call()
        console.log(currentCandidate)
        candidateArray.push({
          id: currentCandidate.candidateId,
          header: currentCandidate.header,
          slogan: currentCandidate.slogan
        })
        i++
      }
      console.log(candidateArray)
      setCandidate(candidateArray)
    } catch (error) {
      console.error(error)
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
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
    await electionInstance.methods
      .addCandidate(candidateName, candidateSlogan)
      .send({ from: accounts, gas: 1000000 })
    window.location.reload()
  }

  if (web3 == null) {
    return <Loading admin={admin} />
  } else if (!admin) {
    return <AdminOnly page='Add Candidate Page.' />
  } else {
    return (
      <React.Fragment>
        <NavbarAdmin />
        <div className='add-candidate-page'>
          <div className='container-main'>
            <h2>Register a New Candidate</h2>
            <h6>Total registered candidates: {Noofcandidate}</h6>
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
                  disabled={
                    candidateName === undefined ||
                    candidateName.length === 0 ||
                    candidateSlogan === undefined ||
                    candidateSlogan.length === 0
                  }
                  onClick={handleSubmit}
                >
                  Add
                </button>
              </form>
            </div>
          </div>
          <div className='container-main'>
            <div className='container-item info'>
              <h2>Candidates List</h2>
            </div>
            {candidate.length < 1 ? (
              <div className='container-item alert'>
                <center>No candidates added.</center>
              </div>
            ) : (
              <div
                className='container-item'
                style={{
                  display: 'block'
                }}
              >
                <table>
                  <tr>
                    <th>Id</th>
                    <th>Candidate</th>
                    <th>Slogan</th>
                  </tr>
                  {candidate.map(renderAdded)}
                </table>
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    )
  }
}
