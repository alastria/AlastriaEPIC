const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");
const AEU = require("../../src/utils/AE_utils");
const AED = require("../../src/wallet/AE_data");
const fs = require("fs");
const AET = require("../../src/utils/AE_constants");
const AEB = require("../../src/utils/AE_blockchain_dummy");
const { userInfo } = require("os");


async function main() {

    // TO-DO - Executing more than once this test return NON VALID LOGIN
    const exampleNumber = "AE0403";
    const exampleText = "Entity Credential Revocation";
    const logTxt = exampleNumber + " " + exampleText + ":\t";

    console.log(logTxt, "STARTED"); 

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    lconsole.log(logTxt,"E - Create object and load identity");
    let entityIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Entity_Identity_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readIdentityWallet(entityIdentityWalletJSON);

    /////////////////////////////////////////////////////
    // Simulate the selection of a credential to revoke
    lconsole.log(logTxt,"E - Select a credential to revocate");
    let leafs = entityEpicWallet.DTree.findAllLeafs();
    let creds = leafs.filter( x => x.data.objectKind == AET.credential);
    let curCred = creds[0];

    // REVOKE IN BLOCKCHAIN
    // RevokeBLK implementation will take care of proper signature of tx
    lconsole.log(logTxt,"E - Revoke credential in Blockchain");
    AEB.RevokeBLK(curCred.data.objectID);    

    // UPDATE OBJECT STATUS IN WALLET
    lconsole.log(logTxt,"E - Update object status");

    let userInfo = curCred.data.objectSubject;

    entityEpicWallet.setObjectStatus(userInfo, curCred.data.objectID,false);


    /////////////////////////////////////////////////////
    // ENTITIES DOES NOTHING MORE WITH CREDENTIAL REVOCATIONS
    
    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET

    lconsole.log(logTxt,"E - Store identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log(logTxt, "FINSIHED"); 

}

main();
