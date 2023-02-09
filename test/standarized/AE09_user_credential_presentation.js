const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");
const AEU = require("../../src/utils/AE_utils");
const AED = require("../../src/wallet/AE_data");
const fs = require("fs");

function aux_getPubkeyFromDummyCred(dummyCredStr) {
    idx_Subject = dummyCredStr.indexOf("Subject");
    idx_id = dummyCredStr.indexOf("id",idx_Subject);
    return dummyCredStr.substring(idx_id + 6, idx_Subject + 134);
  }

async function main() {

    // TODO - Executing more than once this test return NON VALID LOGIN
    console.log("AE09_credential_presentation STARTED");

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/test/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    console.log("AE09 - U - Credential presentation -  User -\tCreate object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);

   
    console.log("AE09 - E - Credential presentation -  Entity -\tCreate object and load identity");
    let entityIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Entity_Identity_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readIdentityWallet(entityIdentityWalletJSON);


    console.log("AE09 - P - Credential presentation -  Provider -Create object and load identity");
    let providerIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Provider_Identity_Wallet.json");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    providerEpicWallet.readIdentityWallet(providerIdentityWalletJSON);


    /////////////////////////////////////////////////////
    // RECOVER USER CREDENTIALS
    let userStorage = new AED.AE_data();
    let userStorageJSON = AEWS.recoverObjects(storagePath + "/test_data/crendential_store.json");
    userStorage.import(userStorageJSON);


    /////////////////////////////////////////////////////
    // USER RECEIVES PRESENTATION REQUEST (in form of Provider presentation derivation)
    console.log("AE09 - P - Credential presentation -  Provider -Create presentation request (derivation)");
    let providerDer = AEL.getRandomIntDerivation().toString();
    commsD.SendTo("Rent_a_K","JohnDoe","PresentationProviderDer",providerDer);
    let spPresDerivation = commsD.Receive("Rent_a_K","JohnDoe","PresentationProviderDer");

    /////////////////////////////////////////////////////
    // GENERATE PRESENTATION PACK
    console.log("AE09 - U - Credential presentation -  User -\tCreate presentation object");

    // In order to do this in the tests we will look for the credentials the user already has, in real life the user will select the credentials
    // automatically from the presentation request or manually in his wallet

    let credIDs = [];
    let keys = userStorage.data.keys();    
    credIDs.push(keys.next().value);
    credIDs.push(keys.next().value);
    credIDs.push(keys.next().value);

    let credential_1_Text = userStorage.getData(credIDs[0]);
    let credential_2_Text = userStorage.getData(credIDs[1]);
    let credential_3_Text = userStorage.getData(credIDs[2]);

    let presentation =     
        "Presentation: [" +
        credential_1_Text +
        "," +
        credential_2_Text +
        "," +
        credential_3_Text +
        "]";

    /////////////////////////////////////////////////////
    // REGISTER PRESENTATION
    console.log("AE09 - U - Credential presentation -  User -\tRegister presentation in wallet");

    let presentationHash = AEL.getHash(presentation);        
    userEpicWallet.setPresentationDerivation("Rent_a_K",presentationHash,spPresDerivation);

    console.log("AE09 - U - Credential presentation -  User -\tGet presentation data for siganture");    
    subjectPublicKey = userEpicWallet.getPresentationExtendedPublicKey("Rent_a_K",presentationHash);
    
    console.log("AE09 - U - Credential presentation -  User -\tSign presentation");
    let presentationSignature = await userEpicWallet.signPresentation("Rent_a_K",presentationHash,presentation);
        
    console.log("AE09 - U - Credential presentation -  User -\tPrepare presentation data: credentials PubKs");

    

    let cred1_der = userEpicWallet.getCredentialDerivation("AcmeDriving",credIDs[0]);
    let cred2_der = userEpicWallet.getCredentialDerivation("AcmeDriving",credIDs[1]);
    let cred3_der = userEpicWallet.getCredentialDerivation("AcmeDriving",credIDs[2]);

    // TEST ONLY, we need to extract the subject DID form the credential, this function only works 
    // with the test credential, projects must implement its own parser
    let credential_pubk_set = [
        aux_getPubkeyFromDummyCred(credential_1_Text),
        aux_getPubkeyFromDummyCred(credential_2_Text),
        aux_getPubkeyFromDummyCred(credential_3_Text),
        ];

    console.log("AE09 - U - Credential presentation -  User -\tPrepare presentation data: credentials derivations");
    let cred_derivation_set = [cred1_der, cred2_der, cred3_der];

    console.log("AE09 - U - Credential presentation -  User -\tPrepare presentation data: identity PublicKey");
    let user_identity_pubK = userEpicWallet.identity_ExtPublicKey;

    // From the registration PubK to the derivation of the presentation
    let presentationDerivation = userEpicWallet.getPresentationDerivation("Rent_a_K",presentationHash);
    

    // User sends the presentation data to the Service Provider
    console.log("AE09 - U - Credential presentation -  User -\tUser sends data to Service Provider 'Rent_a_K'");
    
    commsD.SendTo("JohnDoe","Rent_a_K","presentation",presentation);
    commsD.SendTo("JohnDoe","Rent_a_K","presentationSignature",presentationSignature);
    commsD.SendTo("JohnDoe","Rent_a_K","presentationDerivation",presentationDerivation);


    commsD.SendTo("JohnDoe","Rent_a_K","user_identity_pubK",user_identity_pubK);
    commsD.SendTo("JohnDoe","Rent_a_K","cred_derivation_set",cred_derivation_set);
    commsD.SendTo("JohnDoe","Rent_a_K","credential_pubk_set",credential_pubk_set);


    
    /////////////////////////////////////////////////////
    // SERVICE PROVIDER RECEIVES DATA

    console.log("AE09 - P - Credential presentation -  Provider -'Rent_a_K' receives user data");

    let pres = commsD.Receive("JohnDoe","Rent_a_K","presentation",presentation);
    let sign = commsD.Receive("JohnDoe","Rent_a_K","presentationSignature",presentationSignature);
    let der = commsD.Receive("JohnDoe","Rent_a_K","presentationDerivation",presentationDerivation);

    let user_identity = commsD.Receive("JohnDoe","Rent_a_K","user_identity_pubK");
    let cred_derivations = commsD.Receive("JohnDoe","Rent_a_K","cred_derivation_set");
    let cred_pub_ks = commsD.Receive("JohnDoe","Rent_a_K","credential_pubk_set");
        

    /////////////////////////////////////////////////////
    // SERVICE PROVIDER VALIDATES PRESENTATION SIGNATURE

    
    if (providerEpicWallet.verifyPresentationSignature("JohnDoe",der,pres,sign)) {
        console.log("AE09 - P - Credential presentation -  Provider - CORRECT presentation signature");
      }
      else {
        console.log("AE09 - P - Credential presentation -  Provider - INVALID presentation signature");
      }



    /////////////////////////////////////////////////////
    // SERVICE PROVIDER VALIDATES CHAIN OF TRUST
    
        
    if (providerEpicWallet.verifyChainOfTrust(user_identity,cred_derivations,cred_pub_ks)) {
        console.log("AE09 - P - Credential presentation -  Provider - Chain-of-Trust is CORRECT'");
        }
    else {
        console.log("AE09 - P - Credential presentation -  Provider - Chain-of-Trust is NOT VALID");        
    }

    /////////////////////////////////////////////////////
    // STORE USER CREDENTIALS
    AEWS.storeObjects(userStorage, "crendential_store.json");


    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    console.log("AE09 - U - Credential presentation -  User -\tStore identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log("AE09 - E - Credential presentation -  Entity - \tStore identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    console.log("AE09 - P - Credential presentation -  Provider -\tStore identity wallet");
    AEWS.storeIdentityWallet(providerEpicWallet, storagePath + "/test_data/AE02_Provider_Identity_Wallet.json")

    console.log("AE09_credential_issuance FINISHED");
}

main();
