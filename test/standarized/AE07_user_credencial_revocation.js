const AEUW = require("../../src/wallet/AE_wallet_user");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");
const AED = require("../../src/wallet/AE_data");
const AEB = require("../../src/utils/AE_blockchain_dummy");

async function main() {

    // TODO - Executing more than once this test return NON VALID LOGIN
    console.log("AE07_user_credential_revocation STARTED");

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/test/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    console.log("AE07 - U - User credential revocation -  User -\tCreate object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);


    /////////////////////////////////////////////////////
    // RECOVER USER CREDENTIALS
    console.log("AE07 - U - User credential revocation -  User -\tRecover credential storage");
    let userStorage = new AED.AE_data();
    let userStorageJSON = AEWS.recoverObjects(storagePath + "/test_data/crendential_store.json");
    userStorage.import(userStorageJSON);
    
    /////////////////////////////////////////////////////
    // Simulate the selection of a credential to revoke
    console.log("AE07 - U - User credential revocation -  User -\tRecover one credential data to test recovation");
    let credIDs = [];
    let keys = userStorage.data.keys();    
    credIDs.push(keys.next().value);    

    /////////////////////////////////////////////////////
    // Set in Blockchain credential status to revoked
    console.log("AE07 - U - User credential revocation -  User -\tCall blockchain to set credential hash estatus to revoked");
    // RevokeBLK implementation will take care of proper signature of tx
    AEB.RevokeBLK(credIDs);

    
    let entityFromCred = "AcmeDriving";


    /////////////////////////////////////////////////////
    // Revoke also the DID used in that credential
    console.log("AE07 - U - User credential revocation -  User -\tRecover the ExtPubK(aka DID) to register status to revoked");
    let cred1_der = userEpicWallet.getCredentialDerivation(entityFromCred,credIDs[0]);
    let userPubKWallet = AEL.createRO_HDWalletFromPublicExtendedKey(userEpicWallet.identity_ExtPublicKey)
    let credPubKWallet = AEL.getHDWalletDerivation(userPubKWallet, cred1_der);
    let credExtPubK = AEL.getPublicExtendedKey(credPubKWallet);

    let revPubK = [];
    revPubK.push(credExtPubK)

    console.log("AE07 - U - User credential revocation -  User -\tRevoke ExtPubK(aka DID)");
    // RevokeBLK implementation will take care of proper signature of tx
    AEB.RevokeBLK(revPubK);
    
    console.log("AE07 - U - User credential revocation -  User -\tSet object status in wallet");
    userEpicWallet.setObjectStatus(entityFromCred,credIDs[0],false);

    /////////////////////////////////////////////////////
    // STORE USER CREDENTIALS
    AEWS.storeObjects(userStorage, storagePath + "/test_data/crendential_store.json");

    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    console.log("AE07 - U - User credential revocation -  User -\tStore identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log("AE07_user_credential_revocation FINISHED");
}

main();