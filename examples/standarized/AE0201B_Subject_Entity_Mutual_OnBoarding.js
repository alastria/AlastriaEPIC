const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");


async function main() {

    const exampleNumber = "AE0201B";
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

    
    // START RELATIONSHIP OF USER "JohnDoe" WITH ENTITY "Rent_a_K"
    console.log(logTxt,"U - Create derivation for Entity at User wallet");
    let rent_a_K_derivation = AEL.getRandomIntDerivation().toString();
    userEpicWallet.addBPlusDerivation("Rent_a_K", rent_a_K_derivation);


    // when connecting with Rent_a_K the user will tell Rent_a_K his public key for the communications with Rent_a_K
    console.log(logTxt,"U - User send his public key");
    let Rent_a_KData = userEpicWallet.getBPlusDerivation("Rent_a_K");
    let user_rent_a_K_relationship_public_key = Rent_a_KData.data.own_extendedPublicKey;
    // SEND "Rent_a_K" my extendedPublicKey so it knows who am I
    commsD.SendTo("JohnDoe","Rent_a_K","userExtendedPublicKey",user_rent_a_K_relationship_public_key);

    // START RELATIONSHIP OF ENTITY "Rent_a_K" WITH USER "JohnDoe" 
    console.log(logTxt,"E - Create derivation for User at Entity wallet");
    providerEpicWallet.addCPlusDerivation("JohnDoe");

    console.log(logTxt,"E - Entity receives user public key");
    let user_public_key = commsD.Receive("JohnDoe","Rent_a_K","userExtendedPublicKey");
    providerEpicWallet.updateCPlusDerivationExtendedKeys("JohnDoe",user_public_key);


    console.log(logTxt,"E - User receives 3 entity public key");

    // Entity tells the user their extended public keys
    let WNode = providerEpicWallet.DTree.findChildByData("derivationName","W")[0];
    commsD.SendTo("Rent_a_K","JohnDoe","entity_login_extPubK",WNode.data.login_extPublicKey);
    commsD.SendTo("Rent_a_K","JohnDoe","entity_credentialIssuance_extPubK",WNode.data.credencialIssuance_extPublicKey);
    commsD.SendTo("Rent_a_K","JohnDoe","entity_presentations_extPubK",WNode.data.presentations_extPublicKey);

    // User receives 3 keys
    login_extPublicKey = commsD.Receive("Rent_a_K","JohnDoe","entity_login_extPubK");
    credencialIssuance_extPublicKey = commsD.Receive("Rent_a_K","JohnDoe","entity_credentialIssuance_extPubK");
    presentations_extPublicKey = commsD.Receive("Rent_a_K","JohnDoe","entity_presentations_extPubK");

    // Update wallets with exchanged publicKeys
    userEpicWallet.updateBPlusDerivationExtendedKeys("Rent_a_K", login_extPublicKey, credencialIssuance_extPublicKey, presentations_extPublicKey);
    

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
