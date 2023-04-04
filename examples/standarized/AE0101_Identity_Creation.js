const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEL = require("../../src/AE_library");

async function main() {


    const exampleNumber = "AE0101";
    const exampleText = "Identity Creation";
    const logTxt = exampleNumber + " " + exampleText + ":\t";


    console.log(logTxt, "STARTED");    

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";

    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS
    console.log(logTxt, "U - Create User wallet");
    let userEpicWallet = new AEUW.AE_userWallet();

    console.log(logTxt, "E - Create Entity wallet");
    let entityEpicWallet = new AEEW.AE_entityWallet();

    console.log(logTxt, "P - Create Provider wallet");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    /////////////////////////////////////////////////////


    // SEED THE WALLET
    // These seed MUST be randomly generated using BIP-39 generation
    console.log(logTxt, "U - Assign Mnemonic");
    let userMnemonic = AEL.getRandomMnemonic();
    //let userMnemonic = "access entry across few mixture island pluck lawn harvest fiction buddy decline";
    userEpicWallet.setMnemonic(userMnemonic);

    console.log(logTxt, "E - Assign Mnemonic");
    let entityMnemonic = AEL.getRandomMnemonic();
    // let entityMnemonic = "arctic stage defense wink stone crumble buddy vital element shift earn deal";
    entityEpicWallet.setMnemonic(entityMnemonic);

    console.log(logTxt, "P - Assign Mnemonic");
    let providerMnemonic = AEL.getRandomMnemonic();
    // let providerMnemonic = "hunt angle stage hurt promote daring burger loan ignore kind reform dry";
    providerEpicWallet.setMnemonic(providerMnemonic);
    /////////////////////////////////////////////////////



    // CREATE IDENTITY DERIVATIONS
    // common third paramenter means they work in the same default MTN network

    let commonMTN = "/131071/407/10011001";

    console.log(logTxt, "U - Assign identity derivations");

    // In a real implementation 104162416 should be random, it is fixed for testing purposes
    let user_mZR = "m/1037171/104162416";
    let user_SSSSSW = "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString();
    // let user_SSSSSW = "/104162416/104162416/104162416/104162416/104162416/104162416";
    
    userEpicWallet.setIdentityDerivation(user_mZR, user_SSSSSW, commonMTN);

    console.log(logTxt, "E - Assign identity derivations");
    let entity_mZR = "m/1037171/1241103461";

    let entity_SSSSSW = "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString();
    // let entity_SSSSSW = "/1241103461/1241103461/1241103461/1241103461/1241103461/1241103461";

    entityEpicWallet.setIdentityDerivation(entity_mZR, entity_SSSSSW, commonMTN);


    console.log(logTxt, "P - Assign identity derivations");
    let provider_mZR = "m/1037171/415581744";

    let provider_SSSSSW = "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString() +
        "/" + AEL.getRandomIntDerivation().toString();
    // let provider_SSSSSW = "/1687453124/2141050260/1229666004/344302187/2118467628/304801079";
    
    providerEpicWallet.setIdentityDerivation(provider_mZR, provider_SSSSSW, commonMTN);
    /////////////////////////////////////////////////////
    

    // STORE IDENTITIES
    // Identities are stored in files and not used on a regular basis, only for identity recovery
    console.log(logTxt, "U - Store Recovery Wallet");    
    AEWS.storeRecoveryWallet(userMnemonic, user_mZR, user_SSSSSW, commonMTN, storagePath + "/test_data/AE01_User_Recovery_Wallet.json");


    console.log(logTxt, "E - Store Recovery Wallet");
    AEWS.storeRecoveryWallet(entityMnemonic, entity_mZR, entity_SSSSSW, commonMTN, storagePath + "/test_data/AE01_Entity_Recovery_Wallet.json");

    console.log(logTxt, "P - Store Recovery Wallet");
    AEWS.storeRecoveryWallet(providerMnemonic, provider_mZR, provider_SSSSSW, commonMTN, storagePath + "/test_data/AE01_Provider_Recovery_Wallet.json");

    console.log(logTxt, "FINISHED");
    
}

main();
