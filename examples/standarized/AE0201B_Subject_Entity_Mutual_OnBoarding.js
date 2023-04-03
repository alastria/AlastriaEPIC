const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");


async function main() {

    console.log("AE03_user_entity_relationship STARTED");

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/test/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    console.log("AE03 - U - Relationships - User -\t\tCreate object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);

   
    console.log("AE03 - E - Relationships - Entity -\tCreate object and load identity");
    let entityIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Entity_Identity_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readIdentityWallet(entityIdentityWalletJSON);


    console.log("AE03 - P - Relationships - Provider -\tCreate object and load identity");
    let providerIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Provider_Identity_Wallet.json");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    providerEpicWallet.readIdentityWallet(providerIdentityWalletJSON)

    
    // START RELATIONSHIP OF USER "JohnDoe" WITH ENTITY "Rent_a_K"
    console.log("AE03 - U - Relationships - Entity -\tCreate derivation for Entity at User wallet");
    let rent_a_K_derivation = AEL.getRandomIntDerivation().toString();
    userEpicWallet.addBPlusDerivation("Rent_a_K", rent_a_K_derivation);


    // when connecting with Rent_a_K the user will tell Rent_a_K his public key for the communications with Rent_a_K
    console.log("AE03 - U - Relationships - Entity -\tUser send his public key");
    let Rent_a_KData = userEpicWallet.getBPlusDerivation("Rent_a_K");
    let user_rent_a_K_relationship_public_key = Rent_a_KData.data.own_extendedPublicKey;
    // SEND "Rent_a_K" my extendedPublicKey so it knows who am I
    commsD.SendTo("JohnDoe","Rent_a_K","userExtendedPublicKey",user_rent_a_K_relationship_public_key);

    // START RELATIONSHIP OF ENTITY "Rent_a_K" WITH USER "JohnDoe" 
    console.log("AE03 - E - Relationships - Entity - \tCreate derivation for User at Entity wallet");
    providerEpicWallet.addCPlusDerivation("JohnDoe");

    console.log("AE03 - E - Relationships - Entity - \tEntity receives user public key");
    let user_public_key = commsD.Receive("JohnDoe","Rent_a_K","userExtendedPublicKey");
    providerEpicWallet.updateCPlusDerivationExtendedKeys("JohnDoe",user_public_key);


    console.log("AE03 - E - Relationships - User - \tUser receives 3 entity public key");

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
    console.log("AE03 - U - Relationships -\t\tStore identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log("AE03 - E - Relationships -\t\tStore identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log("AE03 - P - Relationships -\t\tStore identity wallet");
    AEWS.storeIdentityWallet(providerEpicWallet, storagePath + "/test_data/AE02_Provider_Identity_Wallet.json")

    console.log("AE03_user_entity_relationship FINISHED");

};

main();
