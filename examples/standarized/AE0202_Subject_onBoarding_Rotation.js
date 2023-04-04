const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");


async function main() {

    const exampleNumber = "AE0202";
    const exampleText = "Subject OnBoarding Rotation";
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



    // UserWallet changes BPlusDerivation for that entity
    let newDerivation = AEL.getRandomIntDerivation().toString();
    // This renewal invalidates all the pre-existing D & E derivations, therefore all the credentials and presentations from/to this entity
    let oldDerivation = userEpicWallet.renewBPlusDerivation("AcmeDriving",newDerivation);
    // This option preserves existing credentiasl and presentations
    // let oldDerivation2 = userEpicWallet.renewBPlusDerivationPreserving("AcmeDriving",newDerivation);


    // when connecting with AcmeAcademy the user will tell AcmeAcademy his public key for the communications with AcmeAcademy
    console.log(logTxt,"U - User send his public key");
    let acmeDrivingData = userEpicWallet.getBPlusDerivation("AcmeDriving");
    let user_acme_relationship_public_key = acmeDrivingData.data.own_extendedPublicKey;
    // SEND "AcmeDriving" my extendedPublicKey so it knows who am I
    commsD.SendTo("JohnDoe","AcmeDriving","userExtendedPublicKey",user_acme_relationship_public_key);

    // Entity received my new public key
    console.log(logTxt,"E - Entity receives user public key");
    let user_public_key = commsD.Receive("JohnDoe","AcmeDriving","userExtendedPublicKey");
    entityEpicWallet.updateCPlusDerivationExtendedKeys("JohnDoe",user_public_key);


    // THEN A AE0303_Subjec_Login_Rotation.js SHOULD BE EXECUTED


    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    console.log(logTxt,"U - Store identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log(logTxt,"E - Store identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log(logTxt, "FINISHED"); 

};

main();