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


  setMnemonic(mnemonicStr) {
    // 20221024 Do not store identityDerivationStr, it is not necessary to use the wallet after the inizialization, this is more secure
    // base_HDWallet is the only necessary working point, it will be removed after the identity wallet is created
    // IF NECESSARY for recovery Seed + identityDerivationStr will be asked to the user
    this.mnemonic = mnemonicStr;
    this.base_HDWallet = AEL.createHDWalletFromMnemonic(this.mnemonic);
  }

  setIdentityDerivation(mZR_der, SSSSSW_der, MTN_der, MTN_alias = "default-MTN") {
    
    // TODO identity derivation must point to W derivation not N derivation
    // let identityDerivationStr = mZR_der + SSSSSW_der + MTN_der;
    let identityDerivationStr = mZR_der + SSSSSW_der;


    //Check identityDerivsationStr
    AEU.check_require("id_derivation", identityDerivationStr);
    derivations = identityDerivationStr.split("/");

    // Adjust derivation length depending of kind of wallet
    let substract;
    if (this.constructor.name == "AE_entityWallet"){
      substract = 7;
    }
    else if (this.constructor.name == "AE_userWallet") {
      substract = 8;
    }
    // Substract MTNBCDDE length IF User, -7 IF entity
    if (!(derivations.length === (this.identity_pattern.length-substract))) {
      console.log(
        "Identity Derivation Str has ",
        derivations.length,
        "depth not the required ",        
        this.identity_pattern.length-substract // Substract 8 length IF User, 7 IF entity
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
    this.createNewNetwork(MTN_der,true,MTN_alias);

  }

  createNewNetwork(MTN_der, makeDefault = false, MTN_alias) {
    
    // Find W derivation
    // Add MNT_der
    // if makeDefault mark all previour networks default, then make this default
    let child;
    let walletNode = this.DTree.findChildByData("derivationName","W");
    let fWalletNode = walletNode.filter(x => (x.data.validStatus == true));
    if (Array.isArray(fWalletNode)) {
      child = fWalletNode[0];
    }
    else
    {
      child = fWalletNode;
    }

    // If makeDefault mark all the other "N" nodes as not default
    if (makeDefault) {
      let nNodes = child.findChildByData("derivationName","N");
      nNodes.forEach(element => {
        element.data.defaultMTN = false;  
      });
    }

    let data = {};

    let mtnDers = MTN_der.split("/");
    let fMtnDers = mtnDers.filter(x => (x.length>0));


    let derName = "M";
    fMtnDers.forEach(element => {
      data = {};
      data.derivationName = derName;  
      if (derName == "N") {
        // The first identity holds the default MNT (aka net), the rest would be secondary unless marked
        data.defaultMTN = true;  
        data.MTN_alias = MTN_alias;
      }    
      if (derName == "T") {
        derName = "N";
      }
      if (derName == "M") {
        derName = "T";
      }     

      data.derivationValue = element;
      data.validStatus = true;
      // safeAddChild
      // child = child.addChild(data);
      child = this.safeAddChild(child,data);

      child.data.path =
      child.parent.data.path + "/" + child.data.derivationValue;      
    });

    return child;
    
  }

  getNetworkNode(MTN_alias) {

    let wTree;
    let child;

    // TODO find "N" derivation by Alias, replicate in all node searches
    if (MTN_alias === undefined) {
      wTree = this.DTree.findChildByData("defaultMTN", true);
    }
    else {            
      wTree = this.DTree.findChildByData("MTN_alias", MTN_alias);
    }

    if (Array.isArray(wTree)) {
      child = wTree[0];
    }
    else
    {
      child = wTree;
    }

    return child;

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

  findNodeByDerivation(derivationName, derivationValue = "", MTN_alias) {

    // DONE MTN update
    // TODO ERROR in the case of W derivation
    let networkNode;

    if (derivationName == "W") {

      networkNode = this.DTree;

    }
    else
    {
      networkNode = this.getNetworkNode(MTN_alias);
    }

    let fTree;    

    let wTree = networkNode.findChildByData("derivationName", derivationName);
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


  safeAddChild(node, data) {

    // Check if any child has the same derivationName and derivationValue
    let existingDescendant = node.descendants.filter( x => (x.data.derivationName == data.derivationName && x.data.derivationValue == data.derivationValue));
    let firstDescendant = existingDescendant[0];
    
    if ( existingDescendant.length > 0){

      // Should not overrride data, instead raise an error
      //  for (const property in data) {
      //  firstDescendant.data[property] = data[property];
      //  
      //}
      //return firstDescendant;
      let errorStr = "Cannot add child, derivationName: " + data.derivationName + " with derivationValue: " + data.derivationValue + " already exists in the node: " + node.data.derivationName + ":" + node.data.derivationValue;
      throw new Error(errorStr);
    }
    else{

      return node.addChild(data);
    }    
  }

}

module.exports = {
  AE_rootWallet: AE_rootWallet,
};
