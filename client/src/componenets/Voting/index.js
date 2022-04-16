import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../Navbar/Navigation'
import NavbarAdmin from '../Navbar/NavigationAdmin'
import NotInit from '../NotInit'
import getWeb3 from '../../getWeb3'
import Election from '../../contracts/Election.json'
import './index.css'
import Loading from '../Loading'

export default function Voting () {
  const [electionInstance, setElectionIstance] = useState(undefined)
  const [account, setAccount] = useState(null)
  const [web3, setWeb3] = useState(null)
  const [admin, setAdmin] = useState(false)
  const [Noofcandidate, setNoofCandidate] = useState(undefined)
  const [isStart, setIsStart] = useState(false)
  const [isEnd, setIsEnd] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [currentVoter, setCurrentVoter] = useState({
    address: undefined,
    name: null,
    phone: null,
    hasVoted: false,
    isVerified: false,
    isRegistered: false
  })

  useEffect(() => {
    async function load () {
      if (!window.location.hash) {
        window.location = window.location + '#loaded'
        window.location.reload()
      }
      try {
        const web3_instance = await getWeb3()
        const cliaccounts = await web3_instance.eth.getAccounts()
        const networkId = await web3_instance.eth.net.getId()
        const deployedNetwork = Election.networks[networkId]
        const instance = new web3_instance.eth.Contract(
          Election.abi,
          deployedNetwork && deployedNetwork.address
        )

        setWeb3(web3_instance)
        setElectionIstance(instance)
        setAccount(cliaccounts[0])
        const candidateCount = await instance.methods.getTotalCandidate().call()
        setNoofCandidate(candidateCount)
        const startBool = await instance.methods.getStart().call()
        setIsStart(startBool)
        const endBool = await instance.methods.getEnd().call()
        setIsEnd(endBool)
        var candidateArray = []
        let i = 1
        while (i <= candidateCount) {
          const candidate = await instance.methods
            .candidateDetails(i - 1)
            .call()
          candidateArray.push({
            id: candidate.candidateId,
            name: candidate.header,
            slogan: candidate.slogan
          })
          i++
        }
        console.log(candidateArray)
        setCandidates(candidateArray)

        const voter = await instance.methods.voterDetails(cliaccounts[0]).call()

        setCurrentVoter({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered
        })
        const Isadmin = await instance.methods.getAdmin().call()
        if (cliaccounts[0] === Isadmin) {
          setAdmin(true)
        }
      } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        )
        console.error(error)
      }
    }
    load()
  }, [])

  function renderCandidates (candidate) {
    async function castVote (id) {
      await electionInstance.methods
        .vote(id)
        .send({ from: account, gas: 1000000 })
      window.location.reload()
    }
    async function confirmVote (id, header) {
      var r = window.confirm(
        'Vote for ' + header + ' with Id ' + id + '.\nAre you sure?'
      )
      if (r === true) {
        castVote(id)
      }
    }
    return (
      <tr>
        <td>{parseInt(candidate.id) + 1}</td>
        <td>{candidate.name}</td>
        <td>{candidate.slogan}</td>
        <td>
          <button
            onClick={() => confirmVote(candidate.id, candidate.header)}
            className='vote-bth'
            disabled={
              !currentVoter.isRegistered ||
              !currentVoter.isVerified ||
              currentVoter.hasVoted
            }
          >
            Vote
          </button>
        </td>
      </tr>
    )
  }

  if (!web3) {
    return <Loading admin={admin} />
  }

  return (
    <React.Fragment>
      {admin ? <NavbarAdmin /> : <Navbar />}
      <div>
        {!isStart && !isEnd ? (
          <NotInit />
        ) : isStart && !isEnd ? (
          <React.Fragment>
            {currentVoter.isRegistered ? (
              currentVoter.isVerified ? (
                currentVoter.hasVoted ? (
                  <div className='container-item success'>
                    <div>
                      <strong>
                        Bingo, You have casted your vote. You can see the
                        results.
                      </strong>
                      <p />
                      <div className='center'>
                        <Link
                          to='/Results'
                          style={{
                            color: 'black',
                            textDecoration: 'underline'
                          }}
                        >
                          See Results
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='container-item info'>
                    <div className='center'>Cast your vote.</div>
                  </div>
                )
              ) : (
                <div className='container-item attention'>
                  <div className='center'>
                    You have registered for the election. Please wait for the
                    admin to verify.
                  </div>
                </div>
              )
            ) : (
              <React.Fragment>
                <div className='container-item attention'>
                  <div className='center'>
                    <p>You're not registered. Please register first.</p>
                    <br />
                    <Link
                      to='/Registration'
                      style={{ color: 'black', textDecoration: 'underline' }}
                    >
                      Registration Page
                    </Link>
                  </div>
                </div>
              </React.Fragment>
            )}
            <div className='container-main candidate-list'>
              <h2>Eligible Candidates</h2>
              <h6>Total candidates: {candidates && candidates.length}</h6>
              {candidates && candidates.length < 1 ? (
                <div className='container-item attention'>
                  <div className='center'>Not one to vote for.</div>
                </div>
              ) : (
                <>
                  <table>
                    <tr>
                      <th>Id</th>
                      <th>Candidate</th>
                      <th>Slogan</th>
                      <th>Vote</th>
                    </tr>

                    {candidates.map(renderCandidates)}
                  </table>
                </>
              )}
            </div>
          </React.Fragment>
        ) : !isStart && isEnd ? (
          <React.Fragment>
            <div className='container-item attention'>
              <center>
                <h3>The Election has ended. Click below </h3>
                <br />
                <Link
                  to='/Results'
                  style={{ color: 'black', textDecoration: 'underline' }}
                >
                  See results
                </Link>
              </center>
            </div>
          </React.Fragment>
        ) : null}
      </div>
    </React.Fragment>
  )
}
