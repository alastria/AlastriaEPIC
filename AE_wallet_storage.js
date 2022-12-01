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

    fs.writeFileSync(recoveryWalletFile, walletData, {mode:0o600});

}

function readRecoveryWallet(recoveryWalletFile) {

    
    walletData = fs.readFileSync( recoveryWalletFile )
    let wallet = JSON.parse(walletData);

    return wallet;

}

function unParent(walletTree) {
    walletTree.parent = null;
    walletTree.descendants.forEach(element => {
        unParent(element);
    });
  }

function storeIdentityWallet(wallet, identityWalletFile) {

    unParent(wallet.DTree);
    
    let identityWalletData  = JSON.stringify(wallet);
    fs.writeFileSync(identityWalletFile, identityWalletData, {mode:0o600});

}

function reParent(walletTree, parent = null) {
    walletTree.parent = parent;
    walletTree.descendants.forEach(element => {
        reParent(element,walletTree);
    })

}

function readIdentityWallet(identityWalletFile) {

    walletData = fs.readFileSync( identityWalletFile )
    let wallet = JSON.parse(walletData);

    reParent(wallet.DTree);
    return wallet;

}