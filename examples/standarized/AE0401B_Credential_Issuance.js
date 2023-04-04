const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");
const AEU = require("../../src/utils/AE_utils");
const AED = require("../../src/wallet/AE_data");
const fs = require("fs");

async function main() {

    // TO-DO - Executing more than once this test return NON VALID LOGIN
    const exampleNumber = "AE0401B";
    const exampleText = "Credential Issuance";
    const logTxt = exampleNumber + " " + exampleText + ":\t";

    console.log(logTxt, "STARTED"); 
    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    /////////////////////////////////////////////////////
    // RECOVER USER CREDENTIALS
    let userStorage = new AED.AE_data();
    let userStorageJSON = AEWS.recoverObjects(storagePath + "/test_data/crendential_store.json");

    userStorage.import(userStorageJSON);

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
    // PREPARE THE CREDENTIAL
    // Read sample credential
    console.log(logTxt,"E - Prepare Credential");
    let sampleCredential = fs.readFileSync(storagePath + "/sample_credential.json").toString();
    
    // Replace in the credential the ISSUER with Issuer's ExtendedPublicKey
    let purpose = "credencialIssuance_extPublicKey";
    let puK = entityEpicWallet.getPurposePublicKey(purpose);
    sampleCredential = sampleCredential.replace("$ISSUER", puK);

    // Replace in the credential the SCHOOL with the School's ExtentendedPublicKey
    // in this case Issuer = School but Issuer's ExtendedPublicKey is the credencialIssuance
    // and the school is the base, this is atipical
    purpose = "identity_ExtPublicKey";
    puK = entityEpicWallet.getPurposePublicKey(purpose);
    sampleCredential = sampleCredential.replace("$SCHOOL", "School2-ID");


    // User send his two derivations to the Entity, this is the same as sending the DID/ExtPubKey for the crendetial as: 
    // credExtPubK = derive(userExtPubK,credentialDerivation) where credentialDerivation = userDerivation + "/" + entityDerivation
    console.log(logTxt,"U - Send credential derivation to Entity");
    let credentialUserDerivation = AEL.getRandomIntDerivation().toString() + "/" + AEL.getRandomIntDerivation().toString();
    commsD.SendTo("JohnDoe","AcmeDriving","credentialUserDerivation",credentialUserDerivation);

    // Entity receives userCredentialDerivation
    console.log(logTxt,"E - Receive credential derivation from User");
    let userDerivation = commsD.Receive("JohnDoe","AcmeDriving","credentialUserDerivation");

    // Entity selects entityDerivation
    console.log(logTxt,"E - Select Entity credential derivation");
    let entityDerivation = AEL.getRandomIntDerivation().toString();

    // Entity calculates credExtPubKey == DID for this credential
    console.log(logTxt,"E - Calculate user DID for this credential");
    let user = entityEpicWallet.getCPlusDerivation("JohnDoe");
    let tmpUserWallet = AEL.createRO_HDWalletFromPublicExtendedKey(user.data.other_extendedPublicKey);
    let userCredWallet = AEL.getHDWalletDerivation(tmpUserWallet,AEU.cleanDerivation("/1/" + userDerivation+"/"+entityDerivation));
    let userCredExtPubK = AEL.getPublicExtendedKey(userCredWallet);

    // Entity finishes the credential preparation
    console.log(logTxt,"E - Finishes Credential preparation");
    sampleCredential = sampleCredential.replace("$SUBJECT", userCredExtPubK);
    let credentialHash = AEL.getHash(sampleCredential);
    
    // Entity stores credential metaData
    console.log(logTxt,"E - Store Credential information");
    entityEpicWallet.setCredentialInfo(
        "JohnDoe",
        credentialHash,
        userCredExtPubK,
        userDerivation,
        entityDerivation);


    // Entity signs credential
    console.log(logTxt,"E - Signs credential");
    credentialSignature = await entityEpicWallet.signCredential(sampleCredential);

    // Entity sends data to user
    console.log(logTxt,"E - Sends credential and data to user");
    commsD.SendTo("JohnDoe","AcmeDriving","credentialEntityDerivation",entityDerivation);
    commsD.SendTo("JohnDoe","AcmeDriving","credentialHash",credentialHash);
    commsD.SendTo("JohnDoe","AcmeDriving","credential",sampleCredential);
    commsD.SendTo("JohnDoe","AcmeDriving","credentialSignature",credentialSignature);

    // User receives credential and data
    console.log(logTxt,"U - User received credential and data");
    let entityDerivationSent = commsD.Receive("JohnDoe","AcmeDriving","credentialEntityDerivation");
    let credentialHashSent = commsD.Receive("JohnDoe","AcmeDriving","credentialHash");
    let sampleCredentialSent = commsD.Receive("JohnDoe","AcmeDriving","credential");
    let credentialSignatureSent = commsD.Receive("JohnDoe","AcmeDriving","credentialSignature");

    // User registers data
    // Stores credential
    console.log(logTxt,"U - Stores credential and data");    
    userStorage.addData(credentialHashSent,sampleCredentialSent);

    // Registers credential data
    let userCredentialChild = userEpicWallet.setCredentialDerivation(
        "AcmeDriving",
        credentialHashSent,
        entityDerivationSent,undefined,credentialUserDerivation);
    

    // ANYONE CAN VERIFY THE SIGNATURE
    // it requires knowing the Public Key, that would be stored in a public shared system, like an smartContact
    console.log(logTxt,"A - Verify credential signature");
    let peK = AEL.getPrivateExtendedKey(
        entityEpicWallet.getHDWalletByPurpose("credentialIssuance_HDWallet")
        );
    if (AEL.verifyMessageByPublicExtendedKey(
        sampleCredentialSent,
        credentialSignatureSent,
        peK
    )) {
        console.log(logTxt,"A - Signature is CORRECT");
        
    }
    else {
        console.log(logTxt,"A - INVALID Signature");        
    }

    /////////////////////////////////////////////////////
    // STORE USER CREDENTIALS
    AEWS.storeObjects(userStorage, storagePath + "/test_data/crendential_store.json");

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
