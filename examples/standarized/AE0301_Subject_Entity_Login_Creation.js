const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");


async function main() {

    // TO-DO - Executing more than once this test return NON VALID LOGIN
    const exampleNumber = "AE0301";
    const exampleText = "Subject-Entity Login Creation";
    const logTxt = exampleNumber + " " + exampleText + ":\t";

    console.log(logTxt, "STARTED"); 

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    console.log(logTxt,"U - Create object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);

   
    console.log(logTxt,"E - Create object and load identity");
    let entityIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Entity_Identity_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readIdentityWallet(entityIdentityWalletJSON);


    console.log(logTxt,"P - Create object and load identity");
    let providerIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Provider_Identity_Wallet.json");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    providerEpicWallet.readIdentityWallet(providerIdentityWalletJSON);



    /////////////////////////////////////////////////////
    // User creates two levels (random) for login into AcmeDriving
    // Add the two derivation levels for login
    console.log(logTxt,"U - Create login derivation for Entity");
    let loginDerivation = AEL.getRandomIntDerivation().toString() + "/" + AEL.getRandomIntDerivation().toString();
    userEpicWallet.addRenewBplusLoginDerivation("AcmeDriving",loginDerivation);

    console.log(logTxt,"U - Send user login extPubK to Entity");
    // when connecting with AcmeDriving the user will tell AcmeDriving his public key for the communications with AcmeDriving
    let connect_to_acme_academy = userEpicWallet.getBPlusDerivation("AcmeDriving");    
    let user_acme_relationship_public_key = connect_to_acme_academy.data.own_extendedPublicKey;
    commsD.SendTo("JohnDoe","AcmeDriving","user_ext_PubK",user_acme_relationship_public_key);

    console.log(logTxt,"E - Entity receives login extPubK from User");        
    // the identity extPubK already knows + login derivation, maybe extend the functionality of addRenewCplusLoginDerivation 
    let user_ext_PubK = commsD.Receive("JohnDoe","AcmeDriving","user_ext_PubK");
    entityEpicWallet.updateCPlusDerivationExtendedKeys("JohnDoe",user_ext_PubK);
    
    // User also tells AcmeAcademy what is the derivation for login "m/0/" + "233612745/1482382413"
    console.log(logTxt,"U - Send user login derivation to Entity");
    commsD.SendTo("JohnDoe","AcmeDriving","loginDerivation",loginDerivation);

    console.log(logTxt,"E - Entity receives login derivation from User");    
    let user_loginDerivation = commsD.Receive("JohnDoe","AcmeDriving","loginDerivation");
    entityEpicWallet.addRenewCplusLoginDerivation("JohnDoe",user_loginDerivation); 

    
    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    console.log(logTxt,"U - Store identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log(logTxt,"E - Store identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log(logTxt,"P - tStore identity wallet");
    AEWS.storeIdentityWallet(providerEpicWallet, storagePath + "/test_data/AE02_Provider_Identity_Wallet.json")
   

    console.log(logTxt, "FINSIHED"); 

    
}

main();