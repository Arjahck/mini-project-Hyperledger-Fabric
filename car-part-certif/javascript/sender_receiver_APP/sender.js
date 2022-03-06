/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('Sender');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'Sender', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('carcert');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        let done = 0;
        while(done == 0) {
            console.log("\nPossible interaction with the network\n")
            console.log("1) Create new asset")
            console.log("2) Update specific asset")
            console.log("3) Delete specific asset")
            console.log("4) Exit")
            const input = prompt("\nEnter the number of your choice: ");
            if (input == "1"){
                const result = await contract.submitTransaction('CreateAsset','674.24354-2754962514','Lamborghini Aventador','Lamborghini','15/11/2021','Sant Agata Bolognese, Italy','Side radiator for cooling');
                console.log('CreateAsset','674.24354-2754962514','Lamborghini Aventador','Lamborghini','15/11/2021','Sant Agata Bolognese, Italy','Side radiator for cooling');
                console.log('Creating new Asset -> Transaction has been submitted');
            } else if (input == "2"){
                const result = await contract.submitTransaction('UpdateAsset','456.56488-56464864115','Renault 5, Renault 4',"Renault","10/06/1996","Montbéliard, France","Yellow Headlights");
                console.log('UpdateAsset','456.56488-56464864115','Renault 5, Renault 4',"Renault","10/06/1996","Montbéliard, France","Yellow Headlights");
                console.log('Updating Asset -> Transaction has been submitted');
            } else if (input == "3"){
                const result = await contract.submitTransaction('DeleteAsset','674.24354-2754962514');
                console.log('DeleteAsset','674.24354-2754962514');
                console.log('Deleting Asset -> Transaction has been submitted');
            } else if (input == "4"){
                done = 1;
            }

        }

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
