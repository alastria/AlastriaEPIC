const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");


async function main() {

    const exampleNumber = "AE0201";
    const exampleText = "Subject Entity Mutual OnBoarding";
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
    providerEpicWallet.readIdentityWallet(providerIdentityWalletJSON)

    
    // START RELATIONSHIP OF USER "JohnDoe" WITH ENTITY "AcmeDriving"
    console.log(logTxt,"U - Create derivation for Entity at User wallet");
    let acmeDrivingDerivation = AEL.getRandomIntDerivation().toString();
    userEpicWallet.addBPlusDerivation("AcmeDriving", acmeDrivingDerivation);


    // when connecting with AcmeAcademy the user will tell AcmeAcademy his public key for the communications with AcmeAcademy
    console.log(logTxt,"U - User sends his public key");
    let acmeDrivingData = userEpicWallet.getBPlusDerivation("AcmeDriving");
    let user_acme_relationship_public_key = acmeDrivingData.data.own_extendedPublicKey;
    // SEND "AcmeDriving" my extendedPublicKey so it knows who am I
    commsD.SendTo("JohnDoe","AcmeDriving","userExtendedPublicKey",user_acme_relationship_public_key);

    // START RELATIONSHIP OF ENTITY "AcmeDriving" WITH USER "JohnDoe" 
    console.log(logTxt,"E - Create derivation for User at Entity wallet");
    entityEpicWallet.addCPlusDerivation("JohnDoe");

    console.log(logTxt,"E - Entity receives user public key");
    let user_public_key = commsD.Receive("JohnDoe","AcmeDriving","userExtendedPublicKey");
    entityEpicWallet.updateCPlusDerivationExtendedKeys("JohnDoe",user_public_key);


    console.log(logTxt,"E - User receives 3 entity public key");

    // Entity tells the user their extended public keys
    // This is a simplication of a PKI or a Blockchain registry
    let WNode = entityEpicWallet.DTree.findChildByData("derivationName","W")[0];
    commsD.SendTo("AcmeDriving","JohnDoe","entity_login_extPubK",WNode.data.login_extPublicKey);
    commsD.SendTo("AcmeDriving","JohnDoe","entity_credentialIssuance_extPubK",WNode.data.credencialIssuance_extPublicKey);
    commsD.SendTo("AcmeDriving","JohnDoe","entity_presentations_extPubK",WNode.data.presentations_extPublicKey);

    // User receives 3 keys or queries Blockchain registry
    login_extPublicKey = commsD.Receive("AcmeDriving","JohnDoe","entity_login_extPubK");
    credencialIssuance_extPublicKey = commsD.Receive("AcmeDriving","JohnDoe","entity_credentialIssuance_extPubK");
    presentations_extPublicKey = commsD.Receive("AcmeDriving","JohnDoe","entity_presentations_extPubK");

    // Update wallets with exchanged publicKeys
    userEpicWallet.updateBPlusDerivationExtendedKeys("AcmeDriving", login_extPublicKey, credencialIssuance_extPublicKey, presentations_extPublicKey);
    

    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    console.log(logTxt,"U - Store identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log(logTxt,"E - Store identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log(logTxt,"P - tStore identity wallet");
    AEWS.storeIdentityWallet(providerEpicWallet, storagePath + "/test_data/AE02_Provider_Identity_Wallet.json")

    console.log(logTxt, "FINISHED"); 

};

main();
