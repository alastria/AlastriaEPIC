const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");


async function main() {

    console.log("AE02_wallet_creation STARTED");

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";


    // Either follow steps in AE01_identity_creation.js o recover form recovery wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING RECOVERY WALLET
    console.log("AE02 - U - Create User wallet -\t\tCreate object and load recovery");
    let userRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_User_Recovery_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readRecoveryWallet(userRecoveryWalletJSON);

   
    console.log("AE02 - E - Create Entity wallet -\tCreate object and load recovery");
    let entityRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_Entity_Recovery_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readRecoveryWallet(entityRecoveryWalletJSON);


    console.log("AE02 - P - Create Provider wallet -\tCreate object and load recovery");
    let providerRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_Provider_Recovery_Wallet.json");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    providerEpicWallet.readRecoveryWallet(providerRecoveryWalletJSON)

    /////////////////////////////////////////////////////
    // Create a new MTN as sample identity creation (setIdentityDerivation already created identity)
    let commonMTN = "/131071/407/112212211";

    console.log("AE02 - U - Create User wallet -\t\tCreate newMTN");
    userEpicWallet.createNewNetwork(commonMTN,true, "newMTN");

    console.log("AE02 - E - Create Entity wallet -\tCreate newMTN");
    entityEpicWallet.createNewNetwork(commonMTN,true,"newMTN");

    console.log("AE02 - P - Create Provider wallet -\tCreate newMTN");
    providerEpicWallet.createNewNetwork(commonMTN,true,"newMTN");

    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    console.log("AE02 - U - Create User wallet -\t\tStore identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log("AE02 - E - Create Entity wallet -\tStore identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log("AE02 - P - Create Provider wallet -\tStore identity wallet");
    AEWS.storeIdentityWallet(providerEpicWallet, storagePath + "/test_data/AE02_Provider_Identity_Wallet.json")

    console.log("AE02_wallet_creation FINISHED");

}

main()
