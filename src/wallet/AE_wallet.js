const AEL = require("../AE_library");
const AEU = require("../utils/AE_utils");

class AE_rootWallet {
  constructor() {
    (this.mnemonic = ""),
      (this.base_HDWallet = ""),
      (this.identity_pattern = "mZRSSSSSWMTN"),
      (this.identity_HDWallet = "");
  }

  setWalletRecoveryFile(fileStr) {
    this.walletRecoveryFile = fileStr;
  }

  setWalletStoreFile(fileStr) {
    this.walletStoreFile = fileStr;
  }

  setMnemonic(mnemonicStr) {
    // 20221024 Do not store identityDerivationStr, it is not necessary to use the wallet after the inizialization, this is more secure
    // base_HDWallet is the only necessary working point, it will be removed after the identity wallet is created
    // IF NECESSARY for recovery Seed + identityDerivationStr will be asked to the user
    this.mnemonic = mnemonicStr;
    this.base_HDWallet = AEL.createHDWalletFromMnemonic(this.mnemonic);
  }

  setIdentityDerivation(mZR_der, SSSSSW_der, MTN_der) {
    let identityDerivationStr = mZR_der + SSSSSW_der + MTN_der;

    //Check identityDerivsationStr
    AEU.check_require("id_derivation", identityDerivationStr);
    derivations = identityDerivationStr.split("/");
    if (!(derivations.length === this.identity_pattern.length)) {
      console.log(
        "Identity Derivation Str has ",
        derivations.length,
        "depth not the required ",
        this.identity_pattern.length
      );
    }

    // 20221024 Do not store identityDerivationStr, it is not necessary to use the wallet after the inizialization, this is more secure
    // identity_HDWallet is the only necessary working point
    // IF NECESSARY for recovery Seed + identityDerivationStr will be asked to the user
    // 20221117 for security reasons identity derivation is no longer stored
    this.identity_HDWallet = AEL.getHDWalletDerivation(
      this.base_HDWallet,
      identityDerivationStr
    );
    this.identity_ExtPublicKey = AEL.getPublicExtendedKey(
      this.identity_HDWallet
    );

    // base_HDWallet and mnemonic won't be necesary either, it is more secure to delete it
    delete this.base_HDWallet;
    delete this.mnemonic;
  }

  baseVerifyLoginChallenge(
    challengeStr,
    signatureStr,
    other_extendedPublicKey,
    loginDerivation
  ) {
    // YET not working

    // AcmeAcademy verifies signature with the original challenge and the extendedPublicKey AcmeAcademy calculated from the User PubK + Derivation <------
    return AEL.verifyMessageByPublicExtendedKey(
      challengeStr,
      signatureStr,
      AEL.getPublicExtendedKey(
        AEL.getHDWalletDerivation(
          AEL.createRO_HDWalletFromPublicExtendedKey(other_extendedPublicKey),
          "m/0" + loginDerivation
        )
      )
    );
  }
}

module.exports = {
  AE_rootWallet: AE_rootWallet,
};
