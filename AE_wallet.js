const AEL = require ("./AE_libray");

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
        this.base_HDWallet = AEL.createHDWalletFromMnemonic(userEpicWallet.mnemonic);
    }
    setIdentityDerivation (identityDerivationStr) {
        this.identity_derivation = identityDerivationStr;
        this.identity_HDWallet = AEL.getHDWalletDerivation(this.base_HDWallet, this.identity_derivation);
    }
    

    baseVerifyLoginChallenge (challengeStr, signatureStr, derivationObj){
        // YET not working

        // AcmeAcademy verifies signature with the original challenge and the extendedPublicKey AcmeAcademy calculated from the User PubK + Derivation <------
        return AEL.verifyMessageByPublicExtendedKey(challengeStr,signatureStr,
                    AEL.getPublicExtendedKey(
                        AEL.getHDWalletDerivation(
                            AEL.createRO_HDWalletFromPublicExtendedKey(derivationObj.other_extendedPublicKey),
                            "m/0"
                        )
                    )       
                );

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

    async signLoginChallenge (entityStr, signLoginChallenge)
    {

        AcmeAcademy = this.getBPlusDerivation(entityStr);
        let entity_relationship_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet , "m/" + AcmeAcademy.B_derivation);
        // User will create an HDWallet for his communications with the entity
        // common knowledge: "/0" will be the standar derivation for "login" for the user (note: not for entities)
        let entity_relationship_wallet_login = AEL.getHDWalletDerivation(entity_relationship_wallet, "m/0");
        // User signs login challenge with entity_relationship_wallet_login
        // prior to that has to create an Ethereum signer wallet
        let entity_signer_eWallet = 
            AEL.getEthereumWalletFromPrivateKey(
                AEL.getPrivateKeyFromExtended(
                    AEL.getPrivateExtendedKey(entity_relationship_wallet_login)
                )
            );

        let login_challenge_signature = await AEL.signMessage(entity_signer_eWallet, signLoginChallenge);
        return login_challenge_signature;
    }

    verifyLoginChallenge (signerStr, challengeStr, signatureStr){
        // YET not working

        let signerRl = this.getBPlusDerivation(signerStr);
        return this.baseVerifyLoginChallenge(challengeStr,signatureStr,signerRl)

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
        this.login_HDWallet = AEL.getHDWalletDerivation(this.base_HDWallet, this.login_derivation);
        // 1 -> credencial issuance
        this.credencialIssuance_derivation = "m/1";
        this.credencialIssuance_HDWallet = AEL.getHDWalletDerivation(this.base_HDWallet, this.credencialIssuance_derivation);
        // 2 -> presentations
        this.presentations_derivation = "m/2";
        this.presentations_HDWallet = AEL.getHDWalletDerivation(this.base_HDWallet, this.presentations_derivation);

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

    async signLoginChallenge (entityStr, signLoginChallenge)
    {
        // TODO: test with example

        AcmeAcademy = this.getBPlusDerivation(entityStr);
        // common knowledge: "entity/0" would be the standar derivation for "login" for the user BUT it was already in this.login_derivation
        // and therefore we should use login_HDWallet
        let entity_relationship_wallet_login = this.login_HDWallet;
    
        
        // Entity signs login challenge with that login_HDWallet
        // prior to that has to create an Ethereum signer wallet
        let entity_signer_eWallet = 
            AEL.getEthereumWalletFromPrivateKey(
                AEL.getPrivateKeyFromExtended(
                    AEL.getPrivateExtendedKey(entity_relationship_wallet_login)
                )
            );

        let login_challenge_signature = await AEL.signMessage(entity_signer_eWallet, signLoginChallenge);
        return login_challenge_signature;
    }

    verifyLoginChallenge (signerStr, challengeStr, signatureStr){
        // YET not working

        let signerRl = this.getCPlusDerivation(signerStr);
        return this.baseVerifyLoginChallenge(challengeStr,signatureStr,signerRl)

    }
}

module.exports = {
    AE_userWallet: AE_userWallet,
    AE_entityWallet: AE_entityWallet
}