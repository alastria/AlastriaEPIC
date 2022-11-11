const AEL = require ("./AE_libray");
const { toChecksumAddress } = require('ethereum-checksum-address')
const AEUW = require ("./AE_wallet_user");
const AEEW = require ("./AE_wallet_entity");

//const bip39 = require("bip39");

// This may be part of a future Credential class, also including EIP-712 signatures like Lacchain does
function aux_getPubkeyFromDummyCred(dummyCredStr)
{
    idx_Subject = dummyCredStr.indexOf("Subject:");
    return  dummyCredStr.substring(idx_Subject+8,idx_Subject+119);
}


async function main() {

    console.log ("INIT TESTING");
    //console.log (bip39.generateMnemonic());

    console.log ("1st test: create HDWallets");
    let newUserEpicWallet = new AEUW.AE_userWallet();
    newUserEpicWallet.setMnemonic("used rebel ahead harvest journey steak hub core opera wrong rate loan");
    // mZR_der, SSSSSW_der, MTN_der
    //newUserEpicWallet.setIdentityDerivation("m/1037171/94367/36514417/1996133064/444811548/120132567/3152038/848215/131071/0407/10011001");
    newUserEpicWallet.setIdentityDerivation("m/1037171/94367","/36514417/1996133064/444811548/120132567/3152038/848215","/131071/0407/10011001");
    newUserEpicWallet.addBPlusDerivation("AcmeAcademy","6385471");

    let newEntityEpicWallet = new AEEW.AE_entityWallet();    
    newEntityEpicWallet.setMnemonic("manage wage hill kitten joke buyer topic focus observe valid december oyster");
    // mZR_der, SSSSSW_der, MTN_der
    //newEntityEpicWallet.setIdentityDerivation("m/1037171/86307766/1152697438/415781155/342717333/307131644/1042827527/324692716/131071/0407/10011001"); 
    newEntityEpicWallet.setIdentityDerivation("m/1037171/86307766","/1152697438/415781155/342717333/307131644/1042827527/324692716","/131071/0407/10011001");
    newEntityEpicWallet.addCPlusDerivation("User");

    
    var  baseCredentialText = "{Credential_ID:$ID; Issuer:$ISSUER; Subject:$SUBJECT;}";
   
    
    // Replace in the credential the ISSUER with Issuer's ExtendedPublicKey
    baseCredentialText = baseCredentialText.replace("$ISSUER",newEntityEpicWallet.credencialIssuance_extPublicKey);
    
    // Replace in the credential the SCHOOL with the School's ExtentendedPublicKey
    // in this case Issuer = School but Issuer's ExtendedPublicKey is the credencialIssuance
    // and the school is the base, this is atipical     
    credential_1_Text = baseCredentialText.replace("$SCHOOL",newEntityEpicWallet.identity_ExtPublicKey);

    credential_1_Text = credential_1_Text.replace("$ID","87341868-10b0-4a35-971c-b26974b89cb3");
    credential_2_Text = credential_1_Text.replace("$ID","1e0ca9b7-4a20-493a-9f4f-b253febc8379");
    credential_3_Text = credential_1_Text.replace("$ID","aed59aca-d62d-4e0a-a576-c2b34a8e6d8a");
   
    // The credential is issued to a subject, we must use the subject DID or ExtendedPublicKey in the subject
    // To get the ExtendedPublicKey the subject should create a three level derivation: he chooses the first to levels and the entity tells the user the
    // third level, this can change to more levels for security against pre-image attacks
    // Also for identification issues each sigle credential should have a different ID
    newUserEpicWallet.setCredentialDerivation("AcmeAcademy","87341868-10b0-4a35-971c-b26974b89cb3","1845211977");
    newUserEpicWallet.setCredentialDerivation("AcmeAcademy","1e0ca9b7-4a20-493a-9f4f-b253febc8379","518358247");
    newUserEpicWallet.setCredentialDerivation("AcmeAcademy","aed59aca-d62d-4e0a-a576-c2b34a8e6d8a","2135079704");

    // The user public keys for each credential has to be sent to the Issuer
    subjectPublicKey1 = newUserEpicWallet.getCredentialExtendedPublicKey("AcmeAcademy","87341868-10b0-4a35-971c-b26974b89cb3");
    subjectPublicKey2 = newUserEpicWallet.getCredentialExtendedPublicKey("AcmeAcademy","1e0ca9b7-4a20-493a-9f4f-b253febc8379");
    subjectPublicKey3 = newUserEpicWallet.getCredentialExtendedPublicKey("AcmeAcademy","aed59aca-d62d-4e0a-a576-c2b34a8e6d8a");
  
    // The issuer saves the user related info for the credential, just in case is needed in the future (like revocations)
    newEntityEpicWallet.setCredentialInfo("User", "87341868-10b0-4a35-971c-b26974b89cb3", subjectPublicKey1);
    newEntityEpicWallet.setCredentialInfo("User", "1e0ca9b7-4a20-493a-9f4f-b253febc8379", subjectPublicKey2);
    newEntityEpicWallet.setCredentialInfo("User", "aed59aca-d62d-4e0a-a576-c2b34a8e6d8a", subjectPublicKey3);

    // The issuer composes the final credential
    credential_1_Text = credential_1_Text.replace("$SUBJECT",subjectPublicKey1);
    credential_2_Text = credential_2_Text.replace("$SUBJECT",subjectPublicKey2);
    credential_3_Text = credential_3_Text.replace("$SUBJECT",subjectPublicKey3);
   

    // Lets pack the three credentials together
    let credential_set = "credential_set: [" + credential_1_Text + "," + credential_2_Text + "," +credential_3_Text + "]";

    // Create a Wallet for the ServiceProvider
    let newSPWallet = new AEEW.AE_entityWallet();    
    newSPWallet.setMnemonic("hunt angle stage hurt promote daring burger loan ignore kind reform dry");
    // mZR_der, SSSSSW_der, MTN_der
    //newSPWallet.setIdentityDerivation("m/1037171/415581744/1687453124/2141050260/1229666004/344302187/2118467628/304801079/131071/0407/10011001");
    newSPWallet.setIdentityDerivation("m/1037171/415581744","/1687453124/2141050260/1229666004/344302187/2118467628/304801079","/131071/0407/10011001");

    // Exchange between user and service provider
    newSPWallet.addCPlusDerivation("User","2112332019");    
    newUserEpicWallet.addBPlusDerivation("ServiceProvider","956778396");
    
    // when connecting with ServiceProvider the user will tell ServiceProvider his public key for the communications with ServiceProvider
    connect_to_service_provider = newUserEpicWallet.getBPlusDerivation("ServiceProvider");
    user_sp_relationship_public_key = connect_to_service_provider.own_extendedPublicKey;
    

    // when connecting with the user ServiceProvider will tell the user his public key for the communications with ServiceProvider
    // or I may directly give the user the base identity extentedPublicKey PLUS the derivation for him
    // Issue 9 has changed this
    //connect_to_user = newSPWallet.getCPlusDerivation("User");
    //sp_user_relationship_public_key = connect_to_user.own_extendedPublicKey;
    // Instead Entity has to send (or User has to query a PKI/Smartcontrac) the three Entity Keys

    // Update wallets with exchanged publicKeys        
    newUserEpicWallet.updateBPlusDerivationExtendedKeys("ServiceProvider", newSPWallet.login_extPublicKey, newSPWallet.credencialIssuance_extPublicKey, newSPWallet.presentations_extPublicKey);
    newSPWallet.updateCPlusDerivationExtendedKeys("User",user_sp_relationship_public_key);

    // Now the user will sign the Presentation with a /2/derivation/derivation/derivation
    // where the last derivation is decided by the ServiceProvider, he has to tell the SP his part of the derivation
    // and the Public Key at identity level

    newUserEpicWallet.setPresentationDerivation("ServiceProvider","7c3d4c06-891d-4bdf-aa72-f702aa2e66bc","47807");
    
    subjectPublicKey = newUserEpicWallet.getPresentationExtendedPublicKey("ServiceProvider","7c3d4c06-891d-4bdf-aa72-f702aa2e66bc");

    credential_setSignature = await newUserEpicWallet.signPresentation("ServiceProvider", "7c3d4c06-891d-4bdf-aa72-f702aa2e66bc", credential_set);

    // From the registration PubK to the derivation of the presentation
    presentation_derivation = newUserEpicWallet.getPresentationDerivation("ServiceProvider","7c3d4c06-891d-4bdf-aa72-f702aa2e66bc");
    
    // Need to communicate the identity Extended PubK and the derivations to the credentials
    user_identity_pubK = newUserEpicWallet.identity_ExtPublicKey;

    // A la credential derivation le falta la derivacion de la entidad que emitió la credencial
    cred1_der = newUserEpicWallet.getCredentialDerivation("AcmeAcademy","87341868-10b0-4a35-971c-b26974b89cb3");
    cred2_der = newUserEpicWallet.getCredentialDerivation("AcmeAcademy","1e0ca9b7-4a20-493a-9f4f-b253febc8379");
    cred3_der = newUserEpicWallet.getCredentialDerivation("AcmeAcademy","aed59aca-d62d-4e0a-a576-c2b34a8e6d8a");
   
    // TODO: Presentation packaging (or not) and entityWallet verifications
    // Presentation verification
    // - send the SP the derivation of the presentation *stored in THIS VARIABLE* presentation_derivation
    // - Calculate PresentationPubk form the Pubk he registered for the user    
    // - verify signature of the presentation with the PresentationPubK
    newSPWallet.verifyPresentationSignature("User",presentation_derivation,credential_set,credential_setSignature)

    // - send the SP my IdentityPubK and the derivation to the PubK registered for the user *stored in THIS VARIABLE* user_identity_pubK  
    // - send the SP the derivations from the IdentityPubK to each one the DIDs/PubK in the credentials
    //      *stored in THIS VARIABLES*  cred1_der, cred2_der, cred3_der
    // - send the SP the pubk/DID of the credentials (this is external as the credential may store the DID in different ways and positions)
    // - verify that each Pubk+derivation generated the avobe mentioned credentials PubK
    cred_derivation_set = [cred1_der, cred2_der, cred3_der];
    credential_pubk_set = [aux_getPubkeyFromDummyCred(credential_1_Text) ,aux_getPubkeyFromDummyCred(credential_2_Text),aux_getPubkeyFromDummyCred(credential_3_Text)];
    newSPWallet.verifyChainOfTrust(user_identity_pubK,cred_derivation_set,credential_pubk_set);

    // - verify each credential Issuer signature
    // this has been already made at AE_crentialIssuance_test.js example
    // it requires knowing the Public Key, that would be stored in a public shared system, like an smartContact

 }

main ();
