
## Setting up the development environment


#### Getting the requirements

1. Download and install **NodeJS**

   Download and install NodeJS from [here](https://nodejs.org/en/download/ "Go to official NodeJS download page.").

1. Install **truffle** and **ganache-cli** using node packager manager (npm)

   ```shell
   npm install -g truffle
   npm install -g ganache-cli
   ```

1. Install **metamask** browser extension

   Download and install metamask from [here](https://metamask.io/download "Go to official metamask download page.").

### Configuring the project for development

1. Clone this repository

   ```shell
   git clone https://github.com/achintyanath/Decentralized-Voting-System.git
   cd Decentralized-Voting-System
   ```

1. Run local Ethereum blockchain

   ```shell
   ganache-cli
   ```

   > Make sure not to close `ganache-cli` (this network needs to be running all the time)

1. Configure metamask on the browser with the following details \
   Switch on Test Networks on MetaMask \
   Select LocalHost 8545 \
   Import the first account (for admin access) from ganache-cli to the metamask extension on the browser. \
   Import other accounts from ganache-cli to metamask extension to login as normal voter. \
   For detailed explanation, refer to the demo video.
   

1. Deploy smart contract to ganache-cli

   ```shell
   # on the dVoting directory
   truffle migrate
   ```

   > Note: Use `truffle migrate --reset` for re-deployments

1. Launch the development server (frontend)

   ```shell
   cd client
   npm install
   npm start
   ```
