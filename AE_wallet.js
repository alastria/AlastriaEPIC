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


module.exports = {
    AE_rootWallet: AE_rootWallet
}