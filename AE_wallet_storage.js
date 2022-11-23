// Stores wallet for recovery
const fs = require('fs');

module.exports = {storeRecoveryWallet, readRecoveryWallet, storeIdentityWallet, readIdentityWallet}
  

function storeRecoveryWallet(mnemonic, mZR_der, SSSSSW_der, MTN_der, recoveryWalletFile) {
   

    let wallet = {};

    wallet.mnemonic = mnemonic;
    wallet.mZR_der = mZR_der;
    wallet.SSSSSW_der = SSSSSW_der;
    wallet.MTN_der = MTN_der;

    let walletData = JSON.stringify(wallet);

    fs.writeFileSync( recoveryWalletFile, walletData, {mode:0o600});

}

function readRecoveryWallet(recoveryWalletFile) {

    
    walletData = fs.readFileSync( recoveryWalletFile )
    let wallet = JSON.parse(walletData);

    return wallet;

}

function storeIdentityWallet(wallet, identityWalletFile) {


    // 20221117 for tree structure, that has circular references parent->descendant and child->parent
    // we will require a replacer function? https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#parameters
    // and later re-construction of parents
    
    let identityWalletData  = JSON.stringify(wallet);
    fs.writeFileSync( identityWalletFile, identityWalletData, {mode:0o600});

}

function readIdentityWallet(identityWalletFile) {

    walletData = fs.readFileSync( identityWalletFile )
    let wallet = JSON.parse(walletData);

    return wallet;

}