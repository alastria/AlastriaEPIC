const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");


async function main() {

    const exampleNumber = "AE0102";
    const exampleText = "Additional Network Creation";
    const logTxt = exampleNumber + " " + exampleText + ":\t";


    console.log(logTxt, "STARTED");  

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";


    // Either follow steps in AE01_identity_creation.js o recover form recovery wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING RECOVERY WALLET
    lconsole.log(logTxt,"U - Create User wallet");
    let userRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_User_Recovery_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readRecoveryWallet(userRecoveryWalletJSON);

   
    lconsole.log(logTxt,"E - Create Entity wallet");
    let entityRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_Entity_Recovery_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readRecoveryWallet(entityRecoveryWalletJSON);


    lconsole.log(logTxt,"P - Create Provider wallet");
    let providerRecoveryWalletJSON = AEWS.readRecoveryWallet( storagePath + "/test_data/AE01_Provider_Recovery_Wallet.json");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    providerEpicWallet.readRecoveryWallet(providerRecoveryWalletJSON)

    /////////////////////////////////////////////////////
    // Create a new MTN as sample identity creation (setIdentityDerivation already created identity)
    let commonMTN = "/131071/407/112212211";

    lconsole.log(logTxt,"U - Create newMTN");
    userEpicWallet.createNewNetwork(commonMTN,true, "newMTN");

    lconsole.log(logTxt,"E - Create newMTN");
    entityEpicWallet.createNewNetwork(commonMTN,true,"newMTN");

    lconsole.log(logTxt,"P - Create newMTN");
    providerEpicWallet.createNewNetwork(commonMTN,true,"newMTN");

    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    lconsole.log(logTxt,"U - Store identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    lconsole.log(logTxt,"E - Store identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    lconsole.log(logTxt,"P - Store identity wallet");
    AEWS.storeIdentityWallet(providerEpicWallet, storagePath + "/test_data/AE02_Provider_Identity_Wallet.json")

    console.log(logTxt, "FINISHED");  

}

main()
