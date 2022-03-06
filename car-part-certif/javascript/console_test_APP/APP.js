/*
 * SPDX-License-Identifier: Apache-2.0
 */


'use strict';

//const { Wallets } = require('fabric-network');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();


function main() {
    menu();
}


async function menu() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "User" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('carcert');

        var done = 0;
        while(done == 0) {
            console.log("\nPossible interaction with the network\n")
            console.log("1) Create new asset")
            console.log("2) Read specific asset")
            console.log("3) Update specific asset")
            console.log("4) Delete specific asset")
            console.log("5) Get all assets")
            console.log("6) Verify presence of an asset")
            console.log("7) Exit")
            const input = prompt("\nEnter the number of your choice: ");
            if (input == "1"){
                const result = await contract.submitTransaction('CreateAsset','674.24354-2754962514','Lamborghini Aventador','Lamborghini','15/11/2021','Sant Agata Bolognese, Italy','Side radiator for cooling');
                console.log('Creating new Asset -> Transaction has been submitted');
            } else if (input == "2"){
                const result = await contract.evaluateTransaction('ReadAsset','254.51488-54875265847');
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            } else if (input == "3"){
                const result = await contract.submitTransaction('UpdateAsset','456.56488-56464864115','Renault 5, Renault 4',"Renault","10/06/1996","Montbéliard, France","Yellow Headlights");
                console.log('Updating Asset -> Transaction has been submitted');
            } else if (input == "4"){
                const result = await contract.submitTransaction('DeleteAsset','674.24354-2754962514');
                console.log('Deleting Asset -> Transaction has been submitted');
            } else if (input == "5"){
                const result = await contract.evaluateTransaction('GetAllAssets');
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            } else if (input == "6"){
                const result = await contract.evaluateTransaction('AssetExists','674.24354-2754962514');
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            } else if (input == "7"){
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

main()
