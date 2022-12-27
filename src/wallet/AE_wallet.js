const AEL = require("../AE_library");
const AEU = require("../utils/AE_utils");
const AEA = require("./AE_alastree");

class AE_rootWallet {
  constructor() {
    (this.mnemonic = ""),
      (this.base_HDWallet = ""),            
      (this.identity_HDWallet = "")
          // 20221122 new DTree data structure
      let data = {};
      data.derivationName = "m";
      data.path = "m";
      this.DTree = new AEA.AE_Alastree(data);
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

    // Adjust derivation length depending of kind of wallet
    let substract;
    if (this.constructor.name == "AE_entityWallet"){
      substract = 4;
    }
    else if (this.constructor.name == "AE_userWallet") {
      substract = 5;
    }
    // Substract BCDDE length IF User, -4 IF entity
    if (!(derivations.length === (this.identity_pattern.length-substract))) {
      console.log(
        "Identity Derivation Str has ",
        derivations.length,
        "depth not the required ",        
        this.identity_pattern.length-substract // Substract 5 length IF User, -4 IF entity
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

    // Store MTN derivations
    // Get W derivation, it is the first and only "validStatus==true" child in the tree (there can be several in case of generating a new identity)
    
    let childs = this.DTree.descendants.filter( x => ( x.data.validStatus == true));
    let child = childs[0];
    let data = {};

    let mtnDers = MTN_der.split("/");
    let fMtnDers = mtnDers.filter(x => (x.length>0));


    let derName = "M";
    fMtnDers.forEach(element => {
      data = {};
      data.derivationName = derName;      
      if (derName == "T") {
        derName = "N";
      }
      if (derName == "M") {
        derName = "T";
      }     
      if (derName == "N") {
        // The first identity holds the default MNT (aka net), the rest would be secondary unless marked
        data.defaultMTN = true;  
      }
      data.derivationValue = element;
      data.validStatus = true;
      child = child.addChild(data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;      
    });
  }

  createNewNetwork(MNT_der, makeDefault = false) {
    // TODO
    // Find W derivation
    // Add MNT_der
    // if makeDefault mark all previour networks default, then make this default
    
  }


  baseVerifyLoginChallenge(
    challengeStr,
    signatureStr,
    other_extendedPublicKey,
    loginDerivation
  ) {
   
    // Works for entities verifying user login signatures
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


  generateNewIdentity(old_wallet, SSSSSW_der = "") {

    // As "this" object cannot be assigned we do need to reconstruct it
    this.setMnemonic(old_wallet.mnemonic);
    if (SSSSSW_der == "") {
      SSSSSW_der =
        "/" +
        AEL.getRandomIntDerivation() +
        "/" +
        AEL.getRandomIntDerivation() +
        "/" +
        AEL.getRandomIntDerivation() +
        "/" +
        AEL.getRandomIntDerivation() +
        "/" +
        AEL.getRandomIntDerivation() +
        "/" +
        AEL.getRandomIntDerivation();
    }
    this.setIdentityDerivation(
      old_wallet.mZR_der,
      SSSSSW_der,
      old_wallet.MTN_der
    );
  }

  readIdentityWallet(wallet) {
    // let wallet = super.readIdentityWallet();
    // As "this" object cannot be assigned we do need to reconstruct it
    this.DTree = wallet.DTree;
    this.identity_ExtPublicKey = wallet.identity_ExtPublicKey;
    this.identity_HDWallet = AEL.createHDWalletFromPrivateExtendedKey(
      wallet.identity_HDWallet._hdkey.xpriv
    );
    this.identity_pattern = wallet.identity_pattern;
    this.walletRecoveryFile = wallet.walletRecoveryFile;
    this.walletStoreFile = wallet.walletStoreFile;
  }

  readRecoveryWallet(wallet) {
    //let wallet = super.readRecoveryWallet(this.walletRecoveryFile);
    // As "this" object cannot be assigned we do need to reconstruct it
    this.setMnemonic(wallet.mnemonic);
    this.setIdentityDerivation(
      wallet.mZR_der,
      wallet.SSSSSW_der,
      wallet.MTN_der
    );
  }

  findNodeByDerivation(derivationName, derivationValue = "") {
    let fTree;

    let wTree = this.DTree.findChildByData("derivationName", derivationName);
    if (wTree.length == 0) {
      return wTree;
    }
    if (derivationValue == "") {
      fTree = wTree.filter((x) => x.data.validStatus == true);
    } else {
      fTree = wTree.filter(
        (x) =>
          x.data.derivationValue == derivationValue &&
          x.data.validStatus == true
      );
    }
    if (Array.isArray(fTree)) {
      return fTree[0];
    } else {
      return fTree;
    }
  }


}

module.exports = {
  AE_rootWallet: AE_rootWallet,
};
