import React from 'react'
import { useState, useEffect  } from 'react'
import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom'
import Navbar from '../Navbar/Navigation'
import NavbarAdmin from '../Navbar/NavigationAdmin'
import UserHome from './UserHome';
import BeginEnd from '../Admin/BeginEnd/index'
import Status from '../Admin/Status/index'
import getWeb3 from '../../getWeb3'
import Election from '../../contracts/Election.json'
import Loading from '../Loading/index'
import './Home.css'

function Home (props) {
  const [ElectionInstance, setElectionInstance] = useState(undefined)
  const [account, setAccount] = useState(null)
  const [web3, setWeb3] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [elStarted, setElStarted] = useState(false)
  const [elEnded, setElEnded] = useState(false)
  const [elDetails, setElDetails] = useState({})

  useEffect(async () => {
    if (!window.location.hash) {
      window.location = window.location + '#loaded'
      window.location.reload()
    }
    try {
      const web3_instance = await getWeb3()
      const accounts = await web3_instance.eth.getAccounts()
      const networkId = await web3_instance.eth.net.getId()
      const deployedNetwork = Election.networks[networkId]
      const instance = new web3_instance.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      )
      setWeb3(web3_instance)
      setElectionInstance(instance)
      setAccount(accounts[0])

      const admin = await instance.methods.getAdmin().call()
      if (accounts[0] === admin) {
        setIsAdmin(true)
      }
      const start = await instance.methods.getStart().call()
      setElStarted(start)
      const end = await instance.methods.getEnd().call()
      setElEnded(end)

      const adminName = await instance.methods.getAdminName().call()
      const adminEmail = await instance.methods.getAdminEmail().call()
      const adminTitle = await instance.methods.getAdminTitle().call()
      const electionTitle = await instance.methods.getElectionTitle().call()
      const organizationTitle = await instance.methods
        .getOrganizationTitle()
        .call()

      setElDetails({
        adminName: adminName,
        adminEmail: adminEmail,
        adminTitle: adminTitle,
        electionTitle: electionTitle,
        organizationTitle: organizationTitle
      })
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3_instance, accounts, or contract. Check console for details.`
      )
      console.error(error)
    }
  }, [])

  async function endElection () {
    await ElectionInstance.methods
      .endElection()
      .send({ from: account, gas: 1000000 })
    window.location.reload()
  }
  async function registerElection (data) {
    await ElectionInstance.methods
      .setElectionDetails(
        data.adminFName.toLowerCase() + ' ' + data.adminLName.toLowerCase(),
        data.adminEmail.toLowerCase(),
        data.adminTitle.toLowerCase(),
        data.electionTitle.toLowerCase(),
        data.organizationTitle.toLowerCase()
      )
      .send({ from: account, gas: 1000000 })
    window.location.reload()
  }

  function renderAdminHome () {
    const EMsg = props => {
      return <span style={{ color: 'tomato' }}>{props.msg}</span>
    }

    function AdminHome () {
      const {
        handleSubmit,
        register,
        formState: { errors }
      } = useForm()

      function onSubmit (data) {
        registerElection(data)
      }

      return (
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {!elStarted & !elEnded ? (
              <div className='container-main'>
                <div className='about-admin'>
                  <h3>About Admin</h3>
                  <div className='container-item center-items'>
                    <div>
                      <label className='label-home'>
                        Full Name{' '}
                        {errors.adminFName && <EMsg msg='*required' />}
                        <input
                          className='input-home'
                          type='text'
                          placeholder='First Name'
                          {...register('adminFName', {
                            required: true
                          })}
                        />
                        <input
                          className='input-home'
                          type='text'
                          placeholder='Last Name'
                          {...register('adminLName')}
                        />
                      </label>

                      <label className='label-home'>
                        Email{' '}
                        {errors.adminEmail && (
                          <EMsg msg={errors.adminEmail.message} />
                        )}
                        <input
                          className='input-home'
                          placeholder='eg. you@example.com'
                          name='adminEmail'
                          {...register('adminEmail', {
                            required: '*Required',
                            pattern: {
                              value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, // email validation using RegExp
                              message: '*Invalid'
                            }
                          })}
                        />
                      </label>

                      <label className='label-home'>
                        Job Title or Position{' '}
                        {errors.adminTitle && <EMsg msg='*required' />}
                        <input
                          className='input-home'
                          type='text'
                          placeholder='eg. HR Head '
                          {...register('adminTitle', {
                            required: true
                          })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {/* about-election */}
                <div className='about-election'>
                  <h3>About Election</h3>
                  <div className='container-item center-items'>
                    <div>
                      <label className='label-home'>
                        Election Title{' '}
                        {errors.electionTitle && <EMsg msg='*required' />}
                        <input
                          className='input-home'
                          type='text'
                          placeholder='eg. School Election'
                          {...register('electionTitle', {
                            required: true
                          })}
                        />
                      </label>
                      <label className='label-home'>
                        Organization Name{' '}
                        {errors.organizationName && <EMsg msg='*required' />}
                        <input
                          className='input-home'
                          type='text'
                          placeholder='eg. Lifeline Academy'
                          {...register('organizationTitle', {
                            required: true
                          })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : elStarted ? (
              <UserHome el={elDetails} />
            ) : null}
            <BeginEnd
              elStarted={elStarted}
              elEnded={elEnded}
              endElFn={endElection}
            />
            <Status elStarted={elStarted} elEnded={elEnded} />
          </form>
        </div>
      )
    }
    return <AdminHome />
  }
  if (!web3) {
    return <Loading />
  }

  return (
    <React.Fragment>
      {isAdmin ? <NavbarAdmin /> : <Navbar />}
      <div className='container-main'>
        <div className='container-item center-items info'>
          Your Account: {account}
        </div>
        {!elStarted & !elEnded ? (
          <div className='container-item info'>
            <center>
              <h3>The election has not been initialize.</h3>
              {isAdmin ? <p>Set up the election.</p> : <p>Please wait..</p>}
            </center>
          </div>
        ) : null}
      </div>
      {isAdmin ? (
        renderAdminHome()
      ) : elStarted ? (
        <>
          <UserHome el={elDetails} />
        </>
      ) : !elStarted && elEnded ? (
        <>
          <div className='container-item attention'>
            <center>
              <h3>The Election ended.</h3>
              <br />
              <Link
                to='/Results'
                style={{ color: 'black', textDecoration: 'underline' }}
              >
                See results
              </Link>
            </center>
          </div>
        </>
      ) : null}
    </React.Fragment>
  )
}

export default Home
