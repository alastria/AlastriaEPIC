const AE = require ("./AE_libray");

const userEpicWallet = {
    mnemonic: "",
    base_HDWallet: "",
    // derivation Z0_A0_A
    identity_derivation: "",
    identity_HDWallet: "",
    Bplus_derivation: []
};

class AE_rootWallet {
    constructor() {
        this.mnemonic = "",
        this.base_HDWallet = "",
        // derivation Z0_A0_A
        this.identity_derivation = "",
        this.identity_HDWallet = "",
        this.Bplus_derivation = []
    }    
    setMnemonic (mnemonicStr) {
        this.mnemonic = mnemonicStr;
        this.base_HDWallet = AE.createHDWalletFromMnemonic(userEpicWallet.mnemonic);
    }
    setIdentityDerivation (identityDerivationStr) {
        this.identity_derivation = identityDerivationStr;
        this.identity_HDWallet = AE.getHDWalletDerivation(this.base_HDWallet, this.identity_derivation);
    }
}

class AE_userWallet extends AE_rootWallet{
    constructor() {
        super();

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
        localBplus.own_extendedPublicKey = ownExtendedKey;
        localBplus.other_extendedPublicKey = other_extendedKey;
        this.Bplus_derivation[localBplusIdx] = localBplus;
    }
}

class AE_entityWallet extends AE_rootWallet{
    constructor() {
        super();        
        this.Cplus_derivation = [];
    }
    
    setMnemonic (mnemonicStr) {
        super.setMnemonic(mnemonicStr);
    }

    setIdentityDerivation (identityDerivationStr) {
        super.setIdentityDerivation(identityDerivationStr);
        // This corresponds to C derivations aka Purpose
        // 0 -> login, may be usefull for C2C interactions or to sign login challenges
        this.login_derivation = "m/0";        
        this.login_HDWallet = AE.getHDWalletDerivation(this.base_HDWallet, this.login_derivation);
        // 1 -> credencial issuance
        this.credencialIssuance_derivation = "m/1";
        this.credencialIssuance_HDWallet = AE.getHDWalletDerivation(this.base_HDWallet, this.credencialIssuance_derivation);
        // 2 -> presentations
        this.presentations_derivation = "m/2";
        this.presentations_HDWallet = AE.getHDWalletDerivation(this.base_HDWallet, this.presentations_derivation);

    }

    addCPlusDerivation (entityStr, derivationStr) {
        let localCPD = {};
        localCPD.entity = entityStr;
        localCPD.C_derivation = derivationStr;
        this.Cplus_derivation.push(localCPD);
    }
    getCPlusDerivation (entityStr) {        
        return this.Cplus_derivation.find(element => element.entity === entityStr);;
    }
    updateCPlusDerivationExtendedKeys (entityStr, ownExtendedKey, other_extendedKey) {
        let localCplus = this.getCPlusDerivation(entityStr);
        let localCplusIdx = this.Cplus_derivation.findIndex(element => element.entity === entityStr);
        localCplus.own_extendedPublicKey = ownExtendedKey;
        localCplus.other_extendedPublicKey = other_extendedKey;
        this.Cplus_derivation[localCplusIdx] = localCplus;
    }
}

module.exports = {
    AE_userWallet: AE_userWallet,
    AE_entityWallet: AE_entityWallet
}