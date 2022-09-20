const AEL = require ("./AE_libray");


class AE_rootWallet {
    constructor() {
        this.mnemonic = "",
        this.base_HDWallet = "",
        // derivation Z0_A0_A
        this.identity_derivation = "",
        this.identity_HDWallet = ""
        
    }    
    setMnemonic (mnemonicStr) {
        this.mnemonic = mnemonicStr;
        this.base_HDWallet = AEL.createHDWalletFromMnemonic(this.mnemonic);
    }
    setIdentityDerivation (identityDerivationStr) {
        this.identity_derivation = identityDerivationStr;
        this.identity_HDWallet = AEL.getHDWalletDerivation(this.base_HDWallet, this.identity_derivation);
        this.identity_ExtPublicKey = AEL.getPublicExtendedKey(this.identity_HDWallet);
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