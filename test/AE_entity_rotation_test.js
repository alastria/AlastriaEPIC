const AEL = require("../src/AE_library");
const { toChecksumAddress } = require("ethereum-checksum-address");
const AEUW = require("../src/wallet/AE_wallet_user");
const AEEW = require("../src/wallet/AE_wallet_entity");
const AEWS = require("./AE_wallet_storage");
const AEU = require("../src/utils/AE_utils");


async function main() {
  console.log("INIT TESTING");
  //console.log (bip39.generateMnemonic());

  console.log("1st test: create HDWallets");

  let newEntityEpicWallet = new AEEW.AE_entityWallet();
  newEntityEpicWallet.setMnemonic(
    "manage wage hill kitten joke buyer topic focus observe valid december oyster"
  );
  // mZR_der, SSSSSW_der, MTN_der
  //newEntityEpicWallet.setIdentityDerivation("m/1037171/86307766/1152697438/415781155/342717333/307131644/1042827527/324692716/131071/0407/10011001");
  newEntityEpicWallet.setIdentityDerivation(
    "m/1037171/86307766",
    "/1152697438/415781155/342717333/307131644/1042827527/324692716",
    "/131071/0407/10011001"
  );


  AEWS.storeRecoveryWallet(
    "manage wage hill kitten joke buyer topic focus observe valid december oyster",
    "m/1037171/86307766",
    "/1152697438/415781155/342717333/307131644/1042827527/324692716",
    "/131071/0407/10011001",
    "./Entity_recovery_wallet.json"
  );

  let revocations = newEntityEpicWallet.revokeCurrentWallet();

  let storedRecoveryWallet = AEWS.readRecoveryWallet(
    "./Entity_recovery_wallet.json"
  );
  
  newEntityEpicWallet.generateNewIdentity(
    storedRecoveryWallet,
    "/1698616024/1400660049/59846251/1797304183/58448343/1152581465"
  );


  
  AEWS.storeIdentityWallet(newEntityEpicWallet, "./Entity_store_wallet.json");

  let copyEntityEpicWallet = new AEEW.AE_entityWallet;
  let EntityIdentityWallet = AEWS.readIdentityWallet("./Entity_store_wallet.json");
  copyEntityEpicWallet.readIdentityWallet(EntityIdentityWallet);
  

  console.log("2nd test: CASE 1: entity rotates its main identity key");


    /// PREPARE DATA FOR REVOCATIONS


  let newUserEpicWallet = new AEUW.AE_userWallet();

  newUserEpicWallet.setMnemonic(
    "access entry across few mixture island pluck lawn harvest fiction buddy decline"
  );

  newUserEpicWallet.setIdentityDerivation(
    "m/1037171/104162416",
    "/104162416/104162416/104162416/104162416/104162416/104162416",
    "/131071/407/10011001"
  );

  newUserEpicWallet.addBPlusDerivation("AcmeAcademy", "484199084");

  newUserEpicWallet.addRenewBplusLoginDerivation(
    "AcmeAcademy",
    "104162416/484199084"
  );

  // when connecting with AcmeAcademy the user will tell AcmeAcademy his public key for the communications with AcmeAcademy
  connect_to_acme_academy = newUserEpicWallet.getBPlusDerivation("AcmeAcademy");
  //user_acme_relationship_public_key = connect_to_acme_academy.own_extendedPublicKey;
  user_acme_relationship_public_key =
    connect_to_acme_academy.data.own_extendedPublicKey;

  // AcmeAcademy as an entity does not have different derivations for users
  newEntityEpicWallet.addCPlusDerivation("User");

  // User also tells AcmeAcademy what is the derivation for login "m/0/" + "233612745/1482382413"
  newEntityEpicWallet.addRenewCplusLoginDerivation(
    "User",
    newUserEpicWallet.getBPlusLoginDerivation("AcmeAcademy")
  );

  cred1Child = newUserEpicWallet.setCredentialDerivation(
    "AcmeAcademy",
    "87341868-10b0-4a35-971c-b26974b89cb3",
    "1845211977"
  );

 
    let cred1Der = AEU.substractDerivations( newUserEpicWallet.getBPlusDerivation("AcmeAcademy").data.path+"/1" ,cred1Child.data.path);
    let cred1UserDer  = AEU.subDerivation(cred1Der,0,2);
    let cred1EntityDer = AEU.subDerivation(cred1Der,2,1);
  
    cred2Child = newUserEpicWallet.setCredentialDerivation(
      "AcmeAcademy",
      "1e0ca9b7-4a20-493a-9f4f-b253febc8379",
      "518358247"
    );
  
    let cred2Der = AEU.substractDerivations( newUserEpicWallet.getBPlusDerivation("AcmeAcademy").data.path+"/1" ,cred1Child.data.path);
    let cred2UserDer  = AEU.subDerivation(cred2Der,0,2);
    let cred2EntityDer = AEU.subDerivation(cred2Der,2,1);
  
    cred3Child = newUserEpicWallet.setCredentialDerivation(
      "AcmeAcademy",
      "aed59aca-d62d-4e0a-a576-c2b34a8e6d8a",
      "2135079704"
    );
  
    let cred3Der = AEU.substractDerivations( newUserEpicWallet.getBPlusDerivation("AcmeAcademy").data.path+"/1" ,cred1Child.data.path);
    let cred3UserDer  = AEU.subDerivation(cred3Der,0,2);
    let cred3EntityDer = AEU.subDerivation(cred3Der,2,1);
  
    // The user public keys for each credential has to be sent to the Issuer
    subjectPublicKey1 = newUserEpicWallet.getCredentialExtendedPublicKey(
      "AcmeAcademy",
      "87341868-10b0-4a35-971c-b26974b89cb3"
    );
    subjectPublicKey2 = newUserEpicWallet.getCredentialExtendedPublicKey(
      "AcmeAcademy",
      "1e0ca9b7-4a20-493a-9f4f-b253febc8379"
    );
    subjectPublicKey3 = newUserEpicWallet.getCredentialExtendedPublicKey(
      "AcmeAcademy",
      "aed59aca-d62d-4e0a-a576-c2b34a8e6d8a"
    );

  // The issuer saves the user related info for the credential, just in case is needed in the future (like revocations)
  newEntityEpicWallet.setCredentialInfo(
    "User",
    "87341868-10b0-4a35-971c-b26974b89cb3",
    subjectPublicKey1,
    cred1UserDer,
    cred1EntityDer
  );
  newEntityEpicWallet.setCredentialInfo(
    "User",
    "1e0ca9b7-4a20-493a-9f4f-b253febc8379",
    subjectPublicKey2,
    cred2UserDer,
    cred2EntityDer
  );
  newEntityEpicWallet.setCredentialInfo(
    "User",
    "aed59aca-d62d-4e0a-a576-c2b34a8e6d8a",
    subjectPublicKey3,
    cred3UserDer,
    cred3EntityDer    
  );


    /// NOW REVOKE (full test)

 revocations = newEntityEpicWallet.revokeCurrentWallet();
  


}

main();
