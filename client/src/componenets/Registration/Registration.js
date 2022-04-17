import React, { Component, useEffect, useState } from 'react'
import Navbar from '../Navbar/Navigation'
import NavbarAdmin from '../Navbar/NavigationAdmin'
import NotInit from '../Notinit'
import './Registration.css'
import getWeb3 from '../../getWeb3'
import Election from '../../contracts/Election.json'
import Loading from '../Loading'

export default function Registration () {
  const [electionInstance, setElectionInstance] = useState()
  const [web3, setweb3] = useState(null)
  const [account, setAccounts] = useState(null)
  const [admin, setAdmin] = useState(false)
  const [candidateName, setCandidateName] = useState('')
  const [isStart, setIsStart] = useState(false)
  const [isEnd, setIsEnd] = useState(false)
  const [NoofVoters, setVoteCount] = useState()
  const [voterName, setvoterName] = useState()
  const [voterPhone, setvoterPhone] = useState()
  const [voters, setVoters] = useState([])
  const [currVoter, setCurrVoter] = useState({
    address: undefined,
    name: null,
    phone: null,
    hasVoted: false,
    isVerified: false,
    isRegistered: false
  })

  async function load () {
    try {
      if (!window.location.hash) {
        window.location = window.location + '#loaded'
        window.location.reload()
      }
      const web3_instance = await getWeb3()
      const accounts = await web3_instance.eth.getAccounts()
      const networkId = await web3_instance.eth.net.getId()
      const deployedNetwork = Election.networks[networkId]
      const instance = new web3_instance.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      )
      setweb3(web3_instance)
      setElectionInstance(instance)
      setAccounts(accounts[0])
      const admin = await instance.methods.getAdmin().call()
      if (accounts[0] === admin) {
        setAdmin(admin)
      }
      const startBool = await instance.methods.getStart().call()
      setIsStart(startBool)
      const endBool = await instance.methods.getEnd().call()
      setIsEnd(endBool)

      const voterCount = await instance.methods.getTotalVoter().call()
      setVoteCount(voterCount)
      for (let i = 0; i < voterCount; i++) {
        const voterAddress = await instance.methods.voters(i).call()
        const voter = await instance.methods.voterDetails(voterAddress).call()

        var voterArray = []
        voterArray.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered
        })
      }
      setVoters(voterArray)
      const voter = await instance.methods.voterDetails(accounts[0]).call()
      setCurrVoter({
        address: voter.voterAddress,
        name: voter.name,
        phone: voter.phone,
        hasVoted: voter.hasVoted,
        isVerified: voter.isVerified,
        isRegistered: voter.isRegistered
      })
    } catch (error) {
      console.error(error)
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      )
    }
  }

  useEffect(() => {
    load()
  }, [])

  function updateVoterName (event) {
    setvoterName(event.target.value)
  }
  function updateVoterPhone (event) {
    setvoterPhone(event.target.value)
  }
  async function registerAsVoter () {
    await electionInstance.methods
      .registerAsVoter(voterName, voterPhone)
      .send({ from: account, gas: 1000000 })
    window.location.reload()
  }

  function loadCurrentVoter (voter, isRegistered) {
    return (
      <>
        <div
          className={
            'container-item ' + (isRegistered ? 'success' : 'attention')
          }
        >
          <center>Your Registered Info</center>
        </div>
        <div
          className={
            'container-list ' + (isRegistered ? 'success' : 'attention')
          }
        >
          <table>
            <tr>
              <th>Account Address</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{voter.hasVoted ? 'True' : 'False'}</td>
            </tr>
            <tr>
              <th>Verification</th>
              <td>{voter.isVerified ? 'True' : 'False'}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? 'True' : 'False'}</td>
            </tr>
          </table>
        </div>
      </>
    )
  }

  function loadAllVoters (voters) {
    const renderAllVoters = voter => {
      return (
        <>
          <div className='container-list success'>
            <table>
              <tr>
                <th>Account address</th>
                <td>{voter.address}</td>
              </tr>
              <tr>
                <th>Name</th>
                <td>{voter.name}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{voter.phone}</td>
              </tr>
              <tr>
                <th>Voted</th>
                <td>{voter.hasVoted ? 'True' : 'False'}</td>
              </tr>
              <tr>
                <th>Verified</th>
                <td>{voter.isVerified ? 'True' : 'False'}</td>
              </tr>
              <tr>
                <th>Registered</th>
                <td>{voter.isRegistered ? 'True' : 'False'}</td>
              </tr>
            </table>
          </div>
        </>
      )
    }
    return (
      <>
        <div className='container-item success'>
          <center>List of voters</center>
        </div>
        {voters&&voters.map(renderAllVoters)}
      </>
    )
  }
  if (!web3) {
    return <Loading />
  }

  return (
    <React.Fragment>
      {admin ? <NavbarAdmin /> : <Navbar />}
      {!isStart && !isEnd ? (
        <NotInit />
      ) : (
        <React.Fragment>
          <div className='container-item info'>
            <p>Total registered voters: {voters && voters.length}</p>
          </div>
          <div className='container-main'>
            <h3>Registration</h3>
            <small>Register to vote.</small>
            <div className='container-item'>
              <form>
                <div className='div-li'>
                  <label className={'label-r'}>
                    Account Address
                    <input
                      className={'input-r'}
                      type='text'
                      value={account}
                      style={{ width: '400px' }}
                    />{' '}
                  </label>
                </div>
                <div className='div-li'>
                  <label className={'label-r'}>
                    Name
                    <input
                      className={'input-r'}
                      type='text'
                      placeholder='eg. Ava'
                      value={voterName}
                      onChange={updateVoterName}
                    />{' '}
                  </label>
                </div>
                <div className='div-li'>
                  <label className={'label-r'}>
                    Phone number <span style={{ color: 'tomato' }}>*</span>
                    <input
                      className={'input-r'}
                      type='number'
                      placeholder='eg. 9841234567'
                      value={voterPhone}
                      onChange={updateVoterPhone}
                    />
                  </label>
                </div>
                <p className='note'>
                  <span style={{ color: 'tomato' }}> Note: </span>
                  <br /> Make sure your account address and Phone number are
                  correct. <br /> Admin might not approve your account if the
                  provided Phone number nub does not matches the account address
                  registered in admins catalogue.
                </p>
                <button
                  className='btn-add'
                  disabled={voterPhone&&voterPhone.length !== 10 || currVoter.isVerified}
                  onClick={registerAsVoter}
                >
                  {currVoter.isRegistered ? 'Update' : 'Register'}
                </button>
              </form>
            </div>
          </div>
          <div
            className='container-main'
            style={{
              borderTop: currVoter.isRegistered ? null : '1px solid'
            }}
          >
            {loadCurrentVoter(currVoter, currVoter.isRegistered)}
          </div>
          {admin ? (
            <div className='container-main' style={{ borderTop: '1px solid' }}>
              <small>TotalVoters: {voters && voters.length}</small>
              {loadAllVoters(voters)}
            </div>
          ) : null}
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
