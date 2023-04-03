const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");
const AEB = require("../../src/utils/AE_blockchain_dummy");


async function main() {

    const exampleNumber = "AE0103";
    const exampleText = "Subject Identity Rotation";
    const logTxt = exampleNumber + " " + exampleText + ":\t";


    console.log(logTxt, "STARTED");  


    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    lconsole.log(logTxt,"U - Create object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);


    // this rotation invalidates all the credentials and presentations
    // as the credentials are always packed into a presentation
    // and the presentation requires user_identity_pubK to check the Chain_of_trust
    // invalidation of user_identity_pubK invalidates the whole presentation
    // Credentials can be revoked by the user by the state change in the registry
    

    // READ THE RECOVERY WALLET 
    lconsole.log(logTxt,"U - Read recovery wallet");
    let storedRecoveryWallet = AEWS.readRecoveryWallet(storagePath + "/test_data/AE01_User_Recovery_Wallet.json");

    // GENERATE NEW DERIVATIONS FOR S(ecurity) levels and W(allet) SSSSSW
    lconsole.log(logTxt,"U - Generate new SSSSSW derivations");
    let newUser_SSSSSW = "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString() +
    "/" + AEL.getRandomIntDerivation().toString();

    // Generate new identity includes marking the previous as non-valid
    lconsole.log(logTxt,"U - Generate new identity");
    let revocations = userEpicWallet.generateNewIdentity(storedRecoveryWallet,newUser_SSSSSW);

    // Proceed with blockchain revocations    
    
    // Revoke in blockchain credentials
    lconsole.log(logTxt,"U - Revoke credentials");
    AEB.RevokeBLK(revocations.credentials);
    
    // Revoke in blockchain all DIDs used with Entities
    lconsole.log(logTxt,"U - Revoke Entity related DIDs/PubKs");
    let BplusPubKeys = revocations.entities.map(x => x.data.own_extendedPublicKey);
    AEB.RevokeBLK(BplusPubKeys);

    // Revoke in blockchain my main DID
    AEB.RevokeBLK(revocations.pubKs);
    
    // Store recovery wallet
    lconsole.log(logTxt,"U - Store Recovery Wallet");
    AEWS.storeRecoveryWallet(storedRecoveryWallet.mnemonic, storedRecoveryWallet.mZR_der, newUser_SSSSSW, storedRecoveryWallet.MTN_der, storagePath + "/test_data/AE01_User_Recovery_Wallet.json");


    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    lconsole.log(logTxt,"U - Store identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log(logTxt, "FINISHED");  

};

main();