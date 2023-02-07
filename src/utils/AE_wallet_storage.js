// Stores wallet for recovery
const fs = require("fs");
const utils = require('./AE_utils')

module.exports = {
  storeRecoveryWallet,
  readRecoveryWallet,
  storeIdentityWallet,
  readIdentityWallet,
  storeObjects,
  recoverObjects
};

function storeRecoveryWallet(
  mnemonic,
  mZR_der,
  SSSSSW_der,
  MTN_der,
  recoveryWalletFile
) {
  let wallet = {};

  wallet.mnemonic = mnemonic;
  wallet.mZR_der = mZR_der;
  wallet.SSSSSW_der = SSSSSW_der;
  wallet.MTN_der = MTN_der;

  let walletData = JSON.stringify(wallet);

  fs.writeFileSync(recoveryWalletFile, walletData, { mode: 0o600 });
}

function readRecoveryWallet(recoveryWalletFile) {
  walletData = fs.readFileSync(recoveryWalletFile);
  let wallet = JSON.parse(walletData);

  return wallet;
}

function storeIdentityWallet(wallet, identityWalletFile) {
  utils.unParent(wallet.DTree);

  let identityWalletData = JSON.stringify(wallet);
  fs.writeFileSync(identityWalletFile, identityWalletData, { mode: 0o600 });

  // required to restore proper status
  utils.reParent(wallet.DTree);
}

function readIdentityWallet(identityWalletFile) {
  walletData = fs.readFileSync(identityWalletFile);
  let wallet = JSON.parse(walletData);

  utils.reParent(wallet.DTree);  
  
  return wallet;
}

function storeObjects(objects, objectsFile) {
  let objectsStr = JSON.stringify(objects, replacer);
  return fs.writeFileSync(objectsFile, objectsStr, { mode: 0o600 });
}

function recoverObjects(objectsFile) {
  let objectsStr = fs.readFileSync(objectsFile);
  let objects = JSON.parse(objectsStr, reviver);  
  return objects;
  
}

function replacer(key, value) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

function reviver(key, value) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}