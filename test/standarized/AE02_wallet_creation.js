const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../AE_wallet_storage");

async function main() {

    console.log("AE02_wallet_creation test");

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/test/standarized";


    // Either follow steps in AE01_identity_creation.js o recover form recovery wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING RECOVERY WALLET
    console.log("AE02 - U - Create User wallet -\t\tCreate object and load recovery");
    let userRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_User_Recovery_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readRecoveryWallet(userRecoveryWalletJSON);

   
    console.log("AE02 - E - Create Entity wallet -\t\tCreate object and load recovery");
    let entityRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_Entity_Recovery_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readRecoveryWallet(entityRecoveryWalletJSON);


    console.log("AE02 - P - Create Provider wallet -\tCreate object and load recovery");
    let providerRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_Provider_Recovery_Wallet.json");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    providerEpicWallet.readRecoveryWallet(providerRecoveryWalletJSON)

    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING RECOVERY WALLET



}

main()
