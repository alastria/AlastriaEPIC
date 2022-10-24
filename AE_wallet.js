const AEL = require ("./AE_libray");
const AEU = require ("./AE_utils.js");


class AE_rootWallet {
    constructor() {
        
        this.base_HDWallet = "",
        this.identity_pattern = "mZRSSSSSWMTN"
        this.identity_derivation = "",
        this.identity_HDWallet = ""
        
    }    
    setMnemonic (mnemonicStr) {
        // 20221024 Do not store identityDerivationStr, it is not necessary to use the wallet after the inizialization, this is more secure
        // base_HDWallet is the only necessary working point, it will be removed after the identity wallet is created
        // IF NECESSARY for recovery Seed + identityDerivationStr will be asked to the user
        this.base_HDWallet = AEL.createHDWalletFromMnemonic(mnemonicStr);
    }
    setIdentityDerivation (identityDerivationStr) {
        //Check identityDerivsationStr
        AEU.check_require("id_derivation",identityDerivationStr);
        derivations = identityDerivationStr.split("/");
        if (!(derivations.length === this.identity_pattern.length)) {
            console.log("Identity Derivation Str has ", derivations.length, "depth not the required ", this.identity_pattern.length);
        }
        
        // 20221024 Do not store identityDerivationStr, it is not necessary to use the wallet after the inizialization, this is more secure
        // identity_HDWallet is the only necessary working point
        // IF NECESSARY for recovery Seed + identityDerivationStr will be asked to the user
        // this.identity_derivation = identityDerivationStr;
        this.identity_HDWallet = AEL.getHDWalletDerivation(this.base_HDWallet, identityDerivationStr);
        // base_HDWallet won't be necesary either, it is more secure to delete it
        delete this.base_HDWallet;
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