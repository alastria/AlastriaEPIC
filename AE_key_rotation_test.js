const AEL = require ("./AE_libray");
const { toChecksumAddress } = require('ethereum-checksum-address')
const AEUW = require ("./AE_wallet_user");
const AEEW = require ("./AE_wallet_entity");

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


    console.log("2nd test: CASE 1: user rotates login key for a given entity");
    // Changing de login derivation does affect only to login, never to credentials
    // Add the two levels for login
    newUserEpicWallet.addRenewBplusLoginDerivation("AcmeAcademy","233612745/1482382413")
    // Communicate to entity    
    newEntityEpicWallet.addRenewCplusLoginDerivation("User","233612745/1482382413");

    // Renew the two levels for login, old levels discarded
    newUserEpicWallet.addRenewBplusLoginDerivation("AcmeAcademy","324871539/2002010179")
    // Communicate the Entity the new levels
    newEntityEpicWallet.addRenewCplusLoginDerivation("User","324871539/2002010179");


    // TODO: Rework from here
    console.log("3rd test: CASE 2: user rotates key for a single entity");

    console.log("3rd test: CASE 2: Step 1. Assign a dummy credential and presentation to user");
   
    newUserEpicWallet.setCredentialDerivation("AcmeAcademy","4b860b60-dd5a-4c3c-ab59-f02252b42772","1251679543");
    
    newUserEpicWallet.addBPlusDerivation("ServiceProvider","956778396");
    newUserEpicWallet.setPresentationDerivation("ServiceProvider","7c3d4c06-891d-4bdf-aa72-f702aa2e66bc","47807");


    // Key rotation for a single entity would be:
    // Keep old data
    old_connect_to_entity = newUserEpicWallet.getBPlusDerivation("AcmeAcademy");
    old_user_entity_relationship_public_key = old_connect_to_entity.data.own_extendedPublicKey;

    // UserWallet changes BPlusDerivation for that entity
    oldDerivation = newUserEpicWallet.renewBPlusDerivation("AcmeAcademy", "14876572");

    //Assign new login derivation, old levels discarded
    newUserEpicWallet.addRenewBplusLoginDerivation("AcmeAcademy","32814639/52854179")

    console.log("Old derivation:", oldDerivation);
    console.log("New derivation:", "14876572");

    console.log("Old ExtendedPublicKey:", old_user_entity_relationship_public_key);


    // -> Should I keep a log of old derivations? yes, wallet will do
    // UserWallet generates new associated ExtendedPublicKey
    // Somehow send the new ExtendedPublicKey to that entity
    connect_to_entity = newUserEpicWallet.getBPlusDerivation("AcmeAcademy");
    user_entity_relationship_public_key = connect_to_entity.data.own_extendedPublicKey;

    console.log("New ExtendedPublicKey:", user_entity_relationship_public_key);
    // Register in Blockchain the old ExtendedPublicKey as "revocated"
    // using old_user_entity_relationship_public_key, signing with the old private key

    // How are the credentials affected?
    // They should be revoked, keep a list of them
    // They are stored under BPlus[entity].old_credentials and old_derivations; An entity many have only one or both types
    let oldCreds = newUserEpicWallet.getOldCredentials("AcmeAcademy", oldDerivation);
    let oldPres = newUserEpicWallet.getOldPresentations("AcmeAcademy", oldDerivation);


    console.log("4th test: CASE 2: user rotates his main identity key");
    // this rotation invalidates all the credentials and presentations
    // as the credentials are always packed into a presentation
    // and the presentation requires user_identity_pubK to check the Chain_of_trust
    // invalidation of user_identity_pubK invalidates the whole presentation
    // Credentials can be revoked by the user by the state change in the registry
    // Would Credentials be "invalidated" with a main identity key rotation?
    // -> That would require multiple invalidations either at key registry level or credential level
    // THIS IS STILL UNDER DISCUSSION
    



}

main ();