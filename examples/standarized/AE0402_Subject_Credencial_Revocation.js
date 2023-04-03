const AEUW = require("../../src/wallet/AE_wallet_user");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");
const AED = require("../../src/wallet/AE_data");
const AEB = require("../../src/utils/AE_blockchain_dummy");

async function main() {

    // TO-DO - Executing more than once this test return NON VALID LOGIN
    const exampleNumber = "AE0402";
    const exampleText = "Subject Credential Revocation";
    const logTxt = exampleNumber + " " + exampleText + ":\t";

    console.log(logTxt, "STARTED"); 

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    lconsole.log(logTxt,"U - User credential revocation -  User -\tCreate object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);


    /////////////////////////////////////////////////////
    // RECOVER USER CREDENTIALS
    lconsole.log(logTxt,"U - User credential revocation -  User -\tRecover credential storage");
    let userStorage = new AED.AE_data();
    let userStorageJSON = AEWS.recoverObjects(storagePath + "/test_data/crendential_store.json");
    userStorage.import(userStorageJSON);
    
    /////////////////////////////////////////////////////
    // Simulate the selection of a credential to revoke
    lconsole.log(logTxt,"U - User credential revocation -  User -\tRecover one credential data to test recovation");
    let credIDs = [];
    let keys = userStorage.data.keys();    
    credIDs.push(keys.next().value);    

    /////////////////////////////////////////////////////
    // Set in Blockchain credential status to revoked
    lconsole.log(logTxt,"U - User credential revocation -  User -\tCall blockchain to set credential hash estatus to revoked");
    // RevokeBLK implementation will take care of proper signature of tx
    AEB.RevokeBLK(credIDs);

    
    let entityFromCred = "AcmeDriving";


    /////////////////////////////////////////////////////
    // Revoke also the DID used in that credential
    lconsole.log(logTxt,"U - User credential revocation -  User -\tRecover the ExtPubK(aka DID) to register status to revoked");
    let cred1_der = userEpicWallet.getCredentialDerivation(entityFromCred,credIDs[0]);
    let userPubKWallet = AEL.createRO_HDWalletFromPublicExtendedKey(userEpicWallet.identity_ExtPublicKey)
    let credPubKWallet = AEL.getHDWalletDerivation(userPubKWallet, cred1_der);
    let credExtPubK = AEL.getPublicExtendedKey(credPubKWallet);

    let revPubK = [];
    revPubK.push(credExtPubK)

    lconsole.log(logTxt,"U - User credential revocation -  User -\tRevoke ExtPubK(aka DID)");
    // RevokeBLK implementation will take care of proper signature of tx
    AEB.RevokeBLK(revPubK);
    
    lconsole.log(logTxt,"U - User credential revocation -  User -\tSet object status in wallet");
    userEpicWallet.setObjectStatus(entityFromCred,credIDs[0],false);

    /////////////////////////////////////////////////////
    // STORE USER CREDENTIALS
    AEWS.storeObjects(userStorage, storagePath + "/test_data/crendential_store.json");

    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    lconsole.log(logTxt,"U - User credential revocation -  User -\tStore identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log(logTxt, "FINSIHED"); 
}

main();