const AEL = require("../src/AE_library");
const { toChecksumAddress } = require("ethereum-checksum-address");
const AEUW = require("../src/wallet/AE_wallet_user");
const AEEW = require("../src/wallet/AE_wallet_entity");
const AEWS = require("./AE_wallet_storage");

async function main() {
  console.log("INIT TESTING");

  console.log("1st test: create HDWallets");
  let newUserEpicWallet = new AEUW.AE_userWallet();
  let newEntityEpicWallet = new AEEW.AE_entityWallet();

  // const mnemonic = bip39.generateMnemonic();
  // User wallet
  //newUserEpicWallet.setWalletRecoveryFile("./User_recovery_wallet.txt");
  //newUserEpicWallet.setWalletStoreFile("./User_store_wallet.txt")
  newUserEpicWallet.setMnemonic(
    "used rebel ahead harvest journey steak hub core opera wrong rate loan"
  );

  // AcmeAcademy also has its own wallet
  //newEntityEpicWallet.setWalletRecoveryFile("./Entity_recovery_wallet,txt");
  //newEntityEpicWallet.setWalletStoreFile("./Entity_store_wallet.txt")
  newEntityEpicWallet.setMnemonic(
    "manage wage hill kitten joke buyer topic focus observe valid december oyster"
  );

  console.log("2nd test: from a HDWallet create initial identity derivation");
  // New derivation schemas
  // Z: Identity: "m/1037171", fixed for identity
  // R: Recovery derivation: 94367
  // SSSSS: Security by Isolation: 36514417/1996133064/444811548/120132567/3152038
  // W: Main identity: 848215
  // M: Method: 131071
  // T: Network Technical: 0407
  // N: Network Name: 10011001
  // Full derivation: "m/1037171/94367/36514417/1996133064/444811548/120132567/3152038/848215/131071/0407/10011001"
  // mZR_der, SSSSSW_der, MTN_der
  //newUserEpicWallet.setIdentityDerivation("m/1037171/94367/36514417/1996133064/444811548/120132567/3152038/848215/131071/407/10011001");
  newUserEpicWallet.setIdentityDerivation(
    "m/1037171/94367",
    "/36514417/1996133064/444811548/120132567/3152038/848215",
    "/131071/407/10011001"
  );
  AEWS.storeRecoveryWallet(
    "used rebel ahead harvest journey steak hub core opera wrong rate loan",
    "m/1037171/94367",
    "/36514417/1996133064/444811548/120132567/3152038/848215",
    "/131071/0407/10011001",
    "./User_recovery_wallet.json"
  );

  // Full derivation: "m/1037171/86307766/1152697438/415781155/342717333/307131644/1042827527/324692716/0407/10011001"
  //newEntityEpicWallet.setIdentityDerivation("m/1037171/86307766/1152697438/415781155/342717333/307131644/1042827527/324692716/131071/407/10011001");
  newEntityEpicWallet.setIdentityDerivation(
    "m/1037171/86307766",
    "/1152697438/415781155/342717333/307131644/1042827527/324692716",
    "/131071/407/10011001"
  );
  AEWS.storeRecoveryWallet(
    "manage wage hill kitten joke buyer topic focus observe valid december oyster",
    "m/1037171/94367",
    "/1152697438/415781155/342717333/307131644/1042827527/324692716",
    "/131071/0407/10011001",
    "./Entity_recovery_wallet.json"
  );

  console.log("3rd test: Login to Acme academy with wallet");
  console.log("\t3rd test, 1st step: Setup communication wallets and keys");

  // in order to login with AcmeAcademy the user will create a new derivation por AcmeAcademy,
  // exteding Z0_A0_A with a random derivation for AcmeAcademy and remembering / storing it
  // AcmeAcademy will be 6385471, random number just for this user
  // the complete derivation of AcmeAcademy for the user would be: "m/1037171/131071/0407/10011001/94367/3651441/6385471"
  newUserEpicWallet.addBPlusDerivation("AcmeAcademy", "6385471");

  // Add the two levels for login
  newUserEpicWallet.addRenewBplusLoginDerivation(
    "AcmeAcademy",
    "233612745/1482382413"
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

  user = newEntityEpicWallet.getCPlusDerivation("User");

  // when connecting with the user AcmeAcademy will tell the user his public key for the communications with AcmeAcademy
  // or I may directly give the user the base identity extentedPublicKey PLUS the derivation for him
  // Issue 9, as B derivations for Entities have been removed this no longer makes sense
  // connecto_to_user = newEntityEpicWallet.getCPlusDerivation("User");
  // acme_user_relationship_public_key = connecto_to_user.own_extendedPublicKey;
  // Instead Entity has to send (or User has to query a PKI/Smartcontrac) the three Entity Keys

  // Update wallets with exchanged publicKeys
  newUserEpicWallet.updateBPlusDerivationExtendedKeys(
    "AcmeAcademy",
    newEntityEpicWallet.login_extPublicKey,
    newEntityEpicWallet.credencialIssuance_extPublicKey,
    newEntityEpicWallet.presentations_extPublicKey
  );
  newEntityEpicWallet.updateCPlusDerivationExtendedKeys(
    "User",
    user_acme_relationship_public_key
  );

  console.log("\t3rd test, 2nd step: Login challenge");
  // acme sends me a login challenge, adding its Extended Public Key acting as DID
  var acme_login_challenge =
    "{'message':'please sign with your Public Key to login','my_publicKey':'replace'}";
  let acme_W_wallet = newEntityEpicWallet.getDerivation("W");

  acme_login_challenge = acme_login_challenge.replace(
    "replace",
    AEL.getPublicExtendedKey(acme_W_wallet.data.login_HDWallet)
  );

  let acme_login_challenge_signature =
    await newUserEpicWallet.signLoginChallenge(
      "AcmeAcademy",
      acme_login_challenge
    );

  //AcmeAcademy verifies signature with the original challenge and the extendedPublicKey AcmeAcademy calculated from the User PubK + Derivation
  // login derviation is something the user has to tell the Entity prior to login exchange
  //let login_derivation = connect_to_acme_academy.data.loginDerivation;
  let login_derivation = newEntityEpicWallet.getLoginDerivation("User");
  newEntityEpicWallet.verifyLoginChallenge(
    "User",
    acme_login_challenge,
    acme_login_challenge_signature
  );

  AEWS.storeIdentityWallet(newUserEpicWallet, "./User_store_wallet.json");

  let copyUserEpicWallet = new AEUW.AE_userWallet();
  let userIdentityWallet = AEWS.readIdentityWallet("./User_store_wallet.json");
  copyUserEpicWallet.readIdentityWallet(userIdentityWallet);

  let recoveredUserEpicWallet = new AEUW.AE_userWallet();
  let otherWallet = AEWS.readRecoveryWallet("./User_recovery_wallet.json");
  recoveredUserEpicWallet.readRecoveryWallet(otherWallet);
  recoveredUserEpicWallet.readIdentityWallet(userIdentityWallet);
}

main();
