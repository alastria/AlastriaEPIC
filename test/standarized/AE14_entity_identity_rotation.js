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
    console.log("AE14_entity_identity_rotation STARTED");

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/test/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    console.log("AE14 - E - Entity identity rotation -  Entity -\tRead recovery wallet");
    let entityIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Entity_Identity_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readIdentityWallet(entityIdentityWalletJSON);

    // READ THE RECOVERY WALLET     
    console.log("AE14 - E - Entity identity rotation -\tCreate object and load recovery");
    let entityRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_Entity_Recovery_Wallet.json");

    
    
    // GENERATE NEW DERIVATIONS FOR S(ecurity) levels and W(allet) SSSSSW
    console.log("AE14 - E - Entity identity rotation - Entity -\t\tGenerate new SSSSSW derivations");
    let newEntity_SSSSSW = "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString();
    
    // Generate new identity includes marking the previous as non-valid
    console.log("AE14 - E - Entity identity Rotation - Entity -\t\tGenerate new identity");
    let revocations = entityEpicWallet.generateNewIdentity(entityRecoveryWalletJSON,newEntity_SSSSSW);
    
    // Proceed with blockchain revocations    
    
    // Revoke in blockchain credentials
    // Only if the identity rotation was due to a security problem
    console.log("AE14 - E - Entity identity rotation - Entity -\t\tRevoke credentials");
    AEB.RevokeBLK(revocations.credentials);
    
    
    // Revoke the DIDs/PubK for identidy, credentials, presentations and login    
    AEB.RevokeBLK(revocations.pubKs);
    

        
    // Store recovery wallet
    console.log("AE14 - E - Entity identity Rotation - \tStore Recovery Wallet");
    AEWS.storeRecoveryWallet(entityRecoveryWalletJSON.mnemonic, entityRecoveryWalletJSON.mZR_der, newEntity_SSSSSW, entityRecoveryWalletJSON.MTN_der, storagePath + "/test_data/AE01_User_Recovery_Wallet.json");


    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET

    console.log("AE14 - E - Entity identity Rotation -  Entity - \tStore identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log("AE14_entity_identity_rotation FINISHED");

}

main();
