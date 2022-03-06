/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const prompt = require('prompt-sync')();


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('Receiver');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'Receiver', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('carcert');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        let done = 0;
	    while(done == 0) {
            console.log("\nPossible interaction with the network\n")
            console.log("1) Read specific asset")
            console.log("2) Get all assets")
            console.log("3) Verify presence of an asset")
            console.log("4) Exit")
            const input = prompt("\nEnter the number of your choice: ");
            if (input == "1"){
                const result = await contract.evaluateTransaction('ReadAsset','254.51488-54875265847');
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            } else if (input == "2"){
                const result = await contract.evaluateTransaction('GetAllAssets');
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            } else if (input == "3"){
                const result = await contract.evaluateTransaction('AssetExists','674.24354-2754962514');
                console.log('AssetExists','674.24354-2754962514');
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            } else if (input == "4"){
                done = 1;
            }

        }
        
// Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
