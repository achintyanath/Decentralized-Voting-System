import React, { useEffect, useState } from 'react'
import Navbar from '../../Navbar/Navigation'
import NavbarAdmin from '../../Navbar/NavigationAdmin'
import getWeb3 from '../../../getWeb3'
import Election from '../../../contracts/Election.json'
import AdminOnly from '../../Admin/OnlyAdmin'
import './index.css'
import Loading from '../../Loading'

export default function Verification () {
  const [ElectionInstance, setElectionInstance] = useState(undefined)
  const [web3, setweb3] = useState(null)
  const [account, setAccount] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [candidateCount, setCandidateCount] = useState()
  const [voterCount, setVoterCount] = useState(undefined)
  const [voters, setVoters] = useState([])

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
      setAccount(accounts[0])

      const Noofcandidates = await instance.methods.getTotalCandidate().call()

      setCandidateCount(Noofcandidates)

      const admin = await instance.methods.getAdmin().call()
      if (accounts[0] === admin) {
        setIsAdmin(true)
      }

      const CountOfVoters = await instance.methods.getTotalVoter().call()

      setVoterCount(CountOfVoters)
      var voterArray = []
      for (let i = 0; i < CountOfVoters; i++) {
        const voterAddress = await instance.methods.voters(i).call()
        const voter = await instance.methods.voterDetails(voterAddress).call()
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
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      console.error(error)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function renderUnverifiedVoters(voter) {
    const verifyVoter = async (verifiedStatus, address) => {
      await ElectionInstance.methods
        .verifyVoter(verifiedStatus, address)
        .send({ from: account, gas: 1000000 })
      window.location.reload()
    }
    return (
      <React.Fragment>
        {voter.isVerified ? (
          <div className='container-list success'>
            <p style={{ margin: '7px 0px' }}>AC: {voter.address}</p>
            <table>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Voted</th>
              </tr>
              <tr>
                <td>{voter.name}</td>
                <td>{voter.phone}</td>
                <td>{voter.hasVoted ? 'True' : 'False'}</td>
              </tr>
            </table>
          </div>
        ) : null}
        <div
          className='container-list attention'
          style={{ display: voter.isVerified ? 'none' : null }}
        >
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
          <div style={{}}>
            <button
              className='btn-verification approve'
              disabled={voter.isVerified}
              onClick={() => verifyVoter(true, voter.address)}
            >
              Approve
            </button>
          </div>
        </div>
      </React.Fragment>
    )
  }

  if (!web3) {
    return <Loading />
  }
  if (!isAdmin) {
    return (
        <AdminOnly page='Verification Page.' />
    )
  }
  return (
    <React.Fragment>
      <NavbarAdmin />
      <div className='container-main'>
        <h3>Verification</h3>
        <h6>Total Voters: {voters&&voters.length}</h6>
        {voters&&voters.length < 1 ? (
          <div className='container-item info'>No one has registered yet.</div>
        ) : (
          <React.Fragment>
            <div className='container-item info'>
              <center>List of registered voters</center>
            </div>
            {voters&&voters.map(renderUnverifiedVoters)}
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  )
}
