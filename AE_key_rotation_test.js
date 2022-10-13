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
    newUserEpicWallet.setIdentityDerivation("m/1037171/131071/0407/10011001/94367/3651441");
    newUserEpicWallet.addBPlusDerivation("AcmeAcademy","6385471");

    let newEntityEpicWallet = new AEEW.AE_entityWallet();    
    newEntityEpicWallet.setMnemonic("manage wage hill kitten joke buyer topic focus observe valid december oyster");
    newEntityEpicWallet.setIdentityDerivation("m/1037171/131071/0407/10011001/96278543/2564789");
    newEntityEpicWallet.addCPlusDerivation("User");


    console.log("2nd test: CASE 1: user rotates key for a single entity");

    // Key rotation for a single entity would be:
    // Keep old data
    old_connect_to_entity = newUserEpicWallet.getBPlusDerivation("AcmeAcademy");
    old_user_entity_relationship_public_key = old_connect_to_entity.own_extendedPublicKey;

    // UserWallet changes BPlusDerivation for that entity
    oldDerivation = newUserEpicWallet.renewBPlusDerivation("AcmeAcademy", "14876572");

    console.log("Old derivation:", oldDerivation);
    console.log("New derivation:", "14876572");

    console.log("Old ExtendedPublicKey:", old_user_entity_relationship_public_key);


    // -> Should I keep a log of old derivations? yes, wallet will do
    // UserWallet generates new associated ExtendedPublicKey
    // Somehow send the new ExtendedPublicKey to that entity
    connect_to_entity = newUserEpicWallet.getBPlusDerivation("AcmeAcademy");
    user_entity_relationship_public_key = connect_to_entity.own_extendedPublicKey;

    console.log("New ExtendedPublicKey:", user_entity_relationship_public_key);

    // Register in Blockchain the old ExtendedPublicKey as "revocated"
    // using old_user_entity_relationship_public_key


}

main ();