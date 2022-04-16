import React, { useEffect, useState } from 'react'
import Navbar from '../../Navbar/Navigation'
import NavbarAdmin from '../../Navbar/NavigationAdmin'
import getWeb3 from '../../../getWeb3'
import Election from '../../../contracts/Election.json'
import { Circles } from 'react-loading-icons'
// import AdminOnly from '../../AdminOnly'
import './index.css'
import Loading from '../../Loading'

export default function Registration () {
    const [ElectionInstance, setElectionInstance] = useState()
    const [web3, setweb3] = useState(null)
    const [account, setAccount] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [candidateCount, setCandidateCount] = useState()
    const [voterCount, setVoterCount]= useState(undefined)
    const [voters, setVoters]= useState([])


    async function load () {
        try {
            if (!window.location.hash) {
                window.location = window.location + '#loaded'
                window.location.reload()
            }

            const web3 = await getWeb3()
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = Election.networks[networkId];
            const instance = new web3.eth.Contract(
                Election.abi,
                deployedNetwork && deployedNetwork.address
            );

            setweb3(web3)
            setElectionInstance(instance)
            setAccount(accounts[0])

            const candidateCount = await ElectionInstance.methods
            .getTotalCandidate()
            .call();

            setCandidateCount(candidateCount)

            const admin = await ElectionInstance.methods.getAdmin().call();
            if (account === admin) {
                setIsAdmin(true);
            }

            const voterCount = await ElectionInstance.methods
            .getTotalVoter()
            .call();

            setVoterCount(voterCount)

            for (let i = 0; i < voterCount; i++) {
                const voterAddress = await ElectionInstance.methods
                .voters(i)
                .call();
                const voter = await ElectionInstance.methods
                .voterDetails(voterAddress)
                .call();
                voters.push({
                address: voter.voterAddress,
                name: voter.name,
                phone: voter.phone,
                hasVoted: voter.hasVoted,
                isVerified: voter.isVerified,
                isRegistered: voter.isRegistered,
                });
            }
            setVoters(voters)

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
            `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.error(error);
        }
    }

    useEffect(() => {
        load()
    }, [])

    renderUnverifiedVoters = (voter) => {
        const verifyVoter = async (verifiedStatus, address) => {
            await ElectionInstance.methods
            .verifyVoter(verifiedStatus, address)
            .send({ from: this.state.account, gas: 1000000 });
            window.location.reload();
        };
        return (
            <>
            {voter.isVerified ? (
                <div className="container-list success">
                <p style={{ margin: "7px 0px" }}>AC: {voter.address}</p>
                <table>
                    <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Voted</th>
                    </tr>
                    <tr>
                    <td>{voter.name}</td>
                    <td>{voter.phone}</td>
                    <td>{voter.hasVoted ? "True" : "False"}</td>
                    </tr>
                </table>
                </div>
            ) : null}
            <div
                className="container-list attention"
                style={{ display: voter.isVerified ? "none" : null }}
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
                    <td>{voter.hasVoted ? "True" : "False"}</td>
                </tr>
                <tr>
                    <th>Verified</th>
                    <td>{voter.isVerified ? "True" : "False"}</td>
                </tr>
                <tr>
                    <th>Registered</th>
                    <td>{voter.isRegistered ? "True" : "False"}</td>
                </tr>
                </table>
                <div style={{}}>
                <button
                    className="btn-verification approve"
                    disabled={voter.isVerified}
                    onClick={() => verifyVoter(true, voter.address)}
                >
                    Approve
                </button>
                </div>
            </div>
            </>
        );
    }

    if (!this.state.web3) {
        return (
            <>
            {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
            <center>Loading Web3, accounts, and contract...</center>
            </>
        );
    }
    if (!this.state.isAdmin) {
        return (
            <>
            <Navbar />
            <AdminOnly page="Verification Page." />
            </>
        );
    }
    return (
    <>
        <NavbarAdmin />
        <div className="container-main">
        <h3>Verification</h3>
        <small>Total Voters: {this.state.voters.length}</small>
        {this.state.voters.length < 1 ? (
            <div className="container-item info">None has registered yet.</div>
        ) : (
            <>
            <div className="container-item info">
                <center>List of registered voters</center>
            </div>
            {this.state.voters.map(this.renderUnverifiedVoters)}
            </>
        )}
        </div>
    </>
    );
}
