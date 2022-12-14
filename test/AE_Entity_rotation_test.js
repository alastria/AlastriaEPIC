const AEL = require("../src/AE_library");
const { toChecksumAddress } = require("ethereum-checksum-address");
const AEUW = require("../src/wallet/AE_wallet_user");
const AEEW = require("../src/wallet/AE_wallet_entity");
const AEWS = require("./AE_wallet_storage");

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


  let storedRecoveryWallet = AEWS.readRecoveryWallet(
    "./Entity_recovery_wallet.json"
  );
  
  newEntityEpicWallet.generateNewIdentity(
    storedRecoveryWallet,
    "/1698616024/1400660049/59846251/1797304183/58448343/1152581465"
  );


  AEWS.storeIdentityWallet(newEntityEpicWallet, "./Entity_store_wallet.json");

  let copyEntityEpicWallet = new AEUW.AE_userWallet();
  let EntityIdentityWallet = AEWS.readIdentityWallet("./Entity_store_wallet.json");
  copyEntityEpicWallet.readIdentityWallet(EntityIdentityWallet);
  

  console.log("2nd test: CASE 1: entity rotates its main identity key");

  



}

main();
