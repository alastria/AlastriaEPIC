const AE = require ("./AE_libray");

const userEpicWallet = {
    mnemonic: "",
    base_HDWallet: "",
    // derivation Z0_A0_A
    identity_derivation: "",
    identity_HDWallet: "",
    Bplus_derivation: []
};


class AE_wallet {
    constructor() {
        this.mnemonic = "",
        this.base_HDWallet = "",
        // derivation Z0_A0_A
        this.identity_derivation = "",
        this.identity_HDWallet = "",
        this.Bplus_derivation = [{}]
    }    
    setMnemonic (mnemonicStr) {
        this.mnemonic = mnemonicStr;
        this.base_HDWallet = AE.createHDWalletFromMnemonic(userEpicWallet.mnemonic);
    }
    setIdentityDerivation (identityDerivationStr) {
        this.identity_derivation = identityDerivationStr;
        this.identity_HDWallet = AE.getHDWalletDerivation(this.base_HDWallet, this.identity_derivation);
    }
    addBPlusDerivation (entityStr, derivationStr) {
        let localBPD = {};
        localBPD.entity = entityStr;
        localBPD.B_derivation = derivationStr;
        this.Bplus_derivation.push(localBPD);
    }
    getBPlusDerivation (entityStr) {        
        return this.Bplus_derivation.find(element => element.entity === entityStr);;
    }
    updateBPlusDerivationExtendedKeys (entityStr, ownExtendedKey, other_extendedKey) {
        let localBplus = this.getBPlusDerivation(entityStr);
        let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr);
        localBplus.own_extendedPublicKey = acme_user_relationship_public_key;
        localBplus.other_extendedPublicKey = user_acme_relationship_public_key;
        this.Bplus_derivation[localBplusIdx] = localBplus;
    }
}

module.exports = {
    AE_wallet: AE_wallet
}