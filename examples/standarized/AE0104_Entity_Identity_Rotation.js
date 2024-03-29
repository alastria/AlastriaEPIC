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

    const exampleNumber = "AE0104";
    const exampleText = "Entity Identity Rotation";
    const logTxt = exampleNumber + " " + exampleText + ":\t";


    console.log(logTxt, "STARTED"); 

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    console.log(logTxt,"E - Read recovery wallet");
    let entityIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Entity_Identity_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readIdentityWallet(entityIdentityWalletJSON);

    // READ THE RECOVERY WALLET     
    console.log(logTxt,"E - Create object and load recovery");
    let entityRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_Entity_Recovery_Wallet.json");

    
    
    // GENERATE NEW DERIVATIONS FOR S(ecurity) levels and W(allet) SSSSSW
    console.log(logTxt,"E - Generate new SSSSSW derivations");
    let newEntity_SSSSSW = "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString();
    
    // Generate new identity includes marking the previous as non-valid
    console.log(logTxt,"E - Generate new identity");
    let revocations = entityEpicWallet.generateNewIdentity(entityRecoveryWalletJSON,newEntity_SSSSSW);
    
    // Proceed with blockchain revocations    
    
    // Revoke in blockchain credentials
    // Only if the identity rotation was due to a security problem
    console.log(logTxt,"E - Revoke credentials");
    AEB.RevokeBLK(revocations.credentials);
    
    
    // Revoke the DIDs/PubK for identidy, credentials, presentations and login    
    AEB.RevokeBLK(revocations.pubKs);
    

        
    // Store recovery wallet
    console.log(logTxt,"E - Store Recovery Wallet");
    AEWS.storeRecoveryWallet(entityRecoveryWalletJSON.mnemonic, entityRecoveryWalletJSON.mZR_der, newEntity_SSSSSW, entityRecoveryWalletJSON.MTN_der, storagePath + "/test_data/AE01_User_Recovery_Wallet.json");


    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET

    console.log(logTxt,"E - Store identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log(logTxt, "FINISHED"); 

}

main();
