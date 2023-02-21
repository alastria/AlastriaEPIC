const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");


async function main() {

    // TODO - Executing more than once this test return NON VALID LOGIN
    console.log("AE04_login STARTED");

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/test/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    console.log("AE04 - U - Login - User -\tCreate object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);

   
    console.log("AE04 - E - Login - Entity -\tCreate object and load identity");
    let entityIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Entity_Identity_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readIdentityWallet(entityIdentityWalletJSON);


    console.log("AE04 - P - Login - Provider -\tCreate object and load identity");
    let providerIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Provider_Identity_Wallet.json");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    providerEpicWallet.readIdentityWallet(providerIdentityWalletJSON);



    /////////////////////////////////////////////////////
    // User creates two levels (random) for login into AcmeDriving
    // Add the two derivation levels for login
    console.log("AE04 - U - Login - User -\tCreate login derivation for Entity");
    let loginDerivation = AEL.getRandomIntDerivation().toString() + "/" + AEL.getRandomIntDerivation().toString();
    userEpicWallet.addRenewBplusLoginDerivation("AcmeDriving",loginDerivation);

    console.log("AE04 - U - Login - User -\tSend user login extPubK to Entity");
    // when connecting with AcmeDriving the user will tell AcmeDriving his public key for the communications with AcmeDriving
    let connect_to_acme_academy = userEpicWallet.getBPlusDerivation("AcmeDriving");    
    let user_acme_relationship_public_key = connect_to_acme_academy.data.own_extendedPublicKey;
    commsD.SendTo("JohnDoe","AcmeDriving","user_ext_PubK",user_acme_relationship_public_key);

    console.log("AE04 - E - Login - Entity -\tEntity receives login extPubK from User");        
    // the identity extPubK already knows + login derivation, maybe extend the functionality of addRenewCplusLoginDerivation 
    let user_ext_PubK = commsD.Receive("JohnDoe","AcmeDriving","user_ext_PubK");
    entityEpicWallet.updateCPlusDerivationExtendedKeys("JohnDoe",user_ext_PubK);
    
    // User also tells AcmeAcademy what is the derivation for login "m/0/" + "233612745/1482382413"
    console.log("AE04 - U - Login - User -\tSend user login derivation to Entity");
    commsD.SendTo("JohnDoe","AcmeDriving","loginDerivation",loginDerivation);

    console.log("AE04 - E - Login - Entity -\tEntity receives login derivation from User");    
    let user_loginDerivation = commsD.Receive("JohnDoe","AcmeDriving","loginDerivation");
    entityEpicWallet.addRenewCplusLoginDerivation("JohnDoe",user_loginDerivation); 

    // TODO Entity signs challenge
    // USER verifies signature of challenge

    // NOW Signing the login challenge
    // Entity may also sign the challenge in the case of mutual authentication
    let acme_login_challenge = "Please sign with your Private Key to login";

    console.log("AE04 - U - Login - User -\tUser signs login challenge");
    let acme_login_challenge_signature = await userEpicWallet.signLoginChallenge("AcmeDriving",acme_login_challenge);
    // user sends challenge signature
    commsD.SendTo("JohnDoe","AcmeDriving","Login_challenge_signature",acme_login_challenge_signature);
    
    console.log("AE04 - E - Login - Entity -\tEntity receives and checks signature");
    // entity receives the signature
    let user_login_signature = commsD.Receive("JohnDoe","AcmeDriving","Login_challenge_signature");

    // entity verifies signature
    if (entityEpicWallet.verifyLoginChallenge("JohnDoe",acme_login_challenge,user_login_signature)){
        console.log("AE04 - E - Login - Entity -\tVALID LOGIN");
    }
    else {
        console.log("AE04 - E - Login - Entity -\tNON VALID LOGIN");
    }

      /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    console.log("AE04 - U - Login - User -\tStore identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log("AE04 - E - Login - Entity - \tStore identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log("AE04 - P - Login - Provider -\tStore identity wallet");
    AEWS.storeIdentityWallet(providerEpicWallet, storagePath + "/test_data/AE02_Provider_Identity_Wallet.json")
   

    console.log("AE04_login FINISHED");

    
}

main();