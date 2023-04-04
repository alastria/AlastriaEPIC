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

    // TO-DO - Executing more than once this test return NON VALID LOGIN
    const exampleNumber = "AE0501";
    const exampleText = "Subject Credential Presentation";
    const logTxt = exampleNumber + " " + exampleText + ":\t";

    console.log(logTxt, "STARTED"); 

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    lconsole.log(logTxt,"U - Create object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);

   
    lconsole.log(logTxt,"E - Create object and load identity");
    let entityIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Entity_Identity_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readIdentityWallet(entityIdentityWalletJSON);


    lconsole.log(logTxt,"P - Create object and load identity");
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
    lconsole.log(logTxt,"P - Create presentation request (derivation)");
    let providerDer = AEL.getRandomIntDerivation().toString();
    commsD.SendTo("Rent_a_K","JohnDoe","PresentationProviderDer",providerDer);
    let spPresDerivation = commsD.Receive("Rent_a_K","JohnDoe","PresentationProviderDer");

    /////////////////////////////////////////////////////
    // GENERATE PRESENTATION PACK
    lconsole.log(logTxt,"U - Create presentation object");

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
    // REGISTER PRESENTATION - User
    lconsole.log(logTxt,"U - Register presentation in wallet");

    let presentationHash = AEL.getHash(presentation);        
    let presentationChild = userEpicWallet.setPresentationDerivation("Rent_a_K",presentationHash,spPresDerivation);


    /////////////////////////////////////////////////////
    // SIGN PRESENTATION


    lconsole.log(logTxt,"U - Get presentation data for siganture");    
    subjectPublicKey = userEpicWallet.getPresentationExtendedPublicKey("Rent_a_K",presentationHash);
    
    lconsole.log(logTxt,"U - Sign presentation");
    let presentationSignature = await userEpicWallet.signPresentation("Rent_a_K",presentationHash,presentation);
        
    lconsole.log(logTxt,"U - Prepare presentation data: credentials PubKs");

    

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

    lconsole.log(logTxt,"U - Prepare presentation data: credentials derivations");
    let cred_derivation_set = [cred1_der, cred2_der, cred3_der];

    lconsole.log(logTxt,"U - Prepare presentation data: identity PublicKey");
    let user_identity_pubK = userEpicWallet.identity_ExtPublicKey;

    // From the registration PubK to the derivation of the presentation
    let presentationDerivation = userEpicWallet.getPresentationDerivation("Rent_a_K",presentationHash);
    

    // User sends the presentation data to the Service Provider
    lconsole.log(logTxt,"U - User sends data to Service Provider 'Rent_a_K'");
    
    commsD.SendTo("JohnDoe","Rent_a_K","presentation",presentation);
    commsD.SendTo("JohnDoe","Rent_a_K","presentationSignature",presentationSignature);
    commsD.SendTo("JohnDoe","Rent_a_K","presentationDerivation",presentationDerivation);
    commsD.SendTo("JohnDoe","Rent_a_K","presentationHash",presentationHash);
    commsD.SendTo("JohnDoe","Rent_a_K","presUserDer",presentationChild.data.objectUserDerivation);
    


    commsD.SendTo("JohnDoe","Rent_a_K","user_identity_pubK",user_identity_pubK);
    commsD.SendTo("JohnDoe","Rent_a_K","cred_derivation_set",cred_derivation_set);
    commsD.SendTo("JohnDoe","Rent_a_K","credential_pubk_set",credential_pubk_set);


    
    /////////////////////////////////////////////////////
    // SERVICE PROVIDER RECEIVES DATA

    lconsole.log(logTxt,"P - 'Rent_a_K' receives user data");

    let pres = commsD.Receive("JohnDoe","Rent_a_K","presentation");
    let sign = commsD.Receive("JohnDoe","Rent_a_K","presentationSignature");
    let der = commsD.Receive("JohnDoe","Rent_a_K","presentationDerivation");
    let presHash= commsD.Receive("JohnDoe","Rent_a_K","presentationHash");
    let presentationUserDerivation = commsD.Receive("JohnDoe","Rent_a_K","presUserDer");

    let user_identity = commsD.Receive("JohnDoe","Rent_a_K","user_identity_pubK");
    let cred_derivations = commsD.Receive("JohnDoe","Rent_a_K","cred_derivation_set");
    let cred_pub_ks = commsD.Receive("JohnDoe","Rent_a_K","credential_pubk_set");

       
    providerEpicWallet.setPresentationInfo("JohnDoe",presHash,user_identity,presentationUserDerivation,providerDer);
        

    /////////////////////////////////////////////////////
    // SERVICE PROVIDER VALIDATES PRESENTATION SIGNATURE

    
    if (providerEpicWallet.verifyPresentationSignature("JohnDoe",der,pres,sign)) {
        lconsole.log(logTxt,"P - Presentation signature of CORRECT");
      }
      else {
        lconsole.log(logTxt,"P - INVALID presentation signature");
      }



    /////////////////////////////////////////////////////
    // SERVICE PROVIDER VALIDATES CHAIN OF TRUST
    
        
    if (providerEpicWallet.verifyChainOfTrust(user_identity,cred_derivations,cred_pub_ks)) {
        lconsole.log(logTxt,"P - Chain-of-Trust is CORRECT'");
        }
    else {
        lconsole.log(logTxt,"P - INVALID Chain-of-Trust");        
    }


    /////////////////////////////////////////////////////
    // SERVICE PROVIDER VALIDATES THE STATUS OF EACH CREDENTIAL IN THE BLOCKCHAIN
    // TO-DO
    


    /////////////////////////////////////////////////////
    // STORE USER CREDENTIALS
    AEWS.storeObjects(userStorage, "crendential_store.json");


    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    lconsole.log(logTxt,"U - Store identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    lconsole.log(logTxt,"E - Store identity wallet");
    AEWS.storeIdentityWallet(entityEpicWallet, storagePath + "/test_data/AE02_Entity_Identity_Wallet.json")

    lconsole.log(logTxt,"P - tStore identity wallet");
    AEWS.storeIdentityWallet(providerEpicWallet, storagePath + "/test_data/AE02_Provider_Identity_Wallet.json")

    console.log(logTxt, "FINSIHED"); 
}

main();
