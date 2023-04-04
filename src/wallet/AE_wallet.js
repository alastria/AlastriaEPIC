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

    // TO-DO identity derivation must point to W derivation not N derivation
    // let identityDerivationStr = mZR_der + SSSSSW_der + MTN_der;
    let identityDerivationStr = mZR_der + SSSSSW_der;


    //Check identityDerivsationStr
    AEU.check_require("id_derivation", identityDerivationStr);

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

      // TO-DO in the case of MTNs it is possible to re-use MT with a new N
      let mNodes = child.findChildByData("derivationName",derName);
      let fmNode = mNodes.filter(x => ((x.data.validStatus == true) && (x.data.derivationValue == element)));      
      if (fmNode.length == 0) {
        child = this.safeAddChild(child,data);
      }
      else if (Array.isArray(fmNode))
      {          
        child = fmNode[0];        
      }
      else  {
        child = fmNode;
      }

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
      child.data.path = child.parent.data.path + "/" + child.data.derivationValue;      
    });

    return child;
    
  }

  getNetworkNode(MTN_alias) {

    let wTree;
    let child;

    // TDDO find "N" derivation by Alias, replicate in all node searches
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

  getMTNDerivation(MTN_alias) {

    let networkNode = this.getNetworkNode(MTN_alias); 
    return AEU.subDerivation(AEU.cleanPath(networkNode.data.path),1);
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
        AEL.getRandomIntDerivation().toString() +
        "/" +
        AEL.getRandomIntDerivation().toString() +
        "/" +
        AEL.getRandomIntDerivation().toString() +
        "/" +
        AEL.getRandomIntDerivation().toString() +
        "/" +
        AEL.getRandomIntDerivation().toString() +
        "/" +
        AEL.getRandomIntDerivation().toString();
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
    
    // DONE: Recovering DTree requires scpecial method: creating an Alastree and processing the string
    this.DTree = new AEA.AE_Alastree;
    this.DTree.parseJSON(wallet.DTree);
    this.identity_ExtPublicKey = wallet.identity_ExtPublicKey;
    this.identity_HDWallet = AEL.createHDWalletFromPrivateExtendedKey(
      wallet.identity_HDWallet._hdkey.xpriv
    );
    this.identity_pattern = wallet.identity_pattern;
    // DONE: ownWallet in B derivations needs special recovery as identity_HDWallet needed
    let Bnodes = this.findSeveralNodesByDerivation("B","",false);
    
    if (!(Bnodes === undefined)) {
      if (Array.isArray(Bnodes)) {
        Bnodes.forEach(element => {
          if (!(element.data.loginWallet === undefined)) {
            element.data.loginWallet = AEL.createHDWalletFromPrivateExtendedKey(element.data.loginWallet._hdkey.xpriv);
          }
          if (!(element.data.own_HDWallet === undefined)) {
            element.data.own_HDWallet = AEL.createHDWalletFromPrivateExtendedKey(element.data.own_HDWallet._hdkey.xpriv);
          }
        });
      }
      else{
        if (!(Bnodes.data.loginWallet === undefined)) {
          Bnodes.data.loginWallet = AEL.createHDWalletFromPrivateExtendedKey(Bnodes.data.loginWallet._hdkey.xpriv);
        }
        if (!(Bnodes.data.own_HDWallet === undefined)) {
          Bnodes.data.own_HDWallet = AEL.createHDWalletFromPrivateExtendedKey(Bnodes.data.own_HDWallet._hdkey.xpriv);
        }

      }
    }

    let Bnodes2 = this.findSeveralNodesByDerivation("B","",true);
    if (!(Bnodes2 === undefined)) {
      if (Array.isArray(Bnodes2)) {
        Bnodes2.forEach(element => {
          if (!(element.data.loginWallet === undefined)) {
            element.data.loginWallet = AEL.createHDWalletFromPrivateExtendedKey(element.data.loginWallet._hdkey.xpriv);
          }
          if (!(element.data.own_HDWallet === undefined)) {
            element.data.own_HDWallet = AEL.createHDWalletFromPrivateExtendedKey(element.data.own_HDWallet._hdkey.xpriv);
          }
        });
      }
      else{
        if (!(Bnodes2.data.loginWallet === undefined)) {
          Bnodes2.data.loginWallet = AEL.createHDWalletFromPrivateExtendedKey(Bnodes2.data.loginWallet._hdkey.xpriv);
        }
        if (!(Bnodes2.data.own_HDWallet === undefined)) {
          Bnodes2.data.own_HDWallet = AEL.createHDWalletFromPrivateExtendedKey(Bnodes2.data.own_HDWallet._hdkey.xpriv);
        }
      }
    }

    


    // TO-DO: entities credentialIssuance_HDWallet, login_HDWallet and presentations_HDWallet required also special treatment

    if (this.constructor.name == "AE_entityWallet")
    {
      let identityW = this.findNodeByDerivation("W");
      let fIdentityW = identityW;
      if (Array.isArray(identityW)) {
        fIdentityW = identityW.filter((x) => x.data.validStatus == true);
      }

      fIdentityW.data.credentialIssuance_HDWallet = AEL.createHDWalletFromPrivateExtendedKey(fIdentityW.data.credentialIssuance_HDWallet._hdkey.xpriv);
      fIdentityW.data.login_HDWallet = AEL.createHDWalletFromPrivateExtendedKey(fIdentityW.data.login_HDWallet._hdkey.xpriv);
      fIdentityW.data.presentations_HDWallet = AEL.createHDWalletFromPrivateExtendedKey(fIdentityW.data.presentations_HDWallet._hdkey.xpriv);
    }

    
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

  findSeveralNodesByDerivation(derivationName, derivationValue = "", validStatus=true, MTN_alias) {

    // DONE MTN update
    // Done ERROR in the case of W derivation
    // TODO: add parameter for validStatus, defaulting to "true"
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
      fTree = wTree.filter((x) => x.data.validStatus == validStatus);
    } else {
      fTree = wTree.filter(
        (x) =>
          x.data.derivationValue == derivationValue &&
          x.data.validStatus == validStatus
      );
    }
    
    return fTree;   

  }


  findNodeByDerivation(derivationName, derivationValue = "", validStatus=true, MTN_alias) {

    let nodos = this.findSeveralNodesByDerivation(derivationName, derivationValue,validStatus,MTN_alias);
    if (Array.isArray(nodos)) {
      return nodos[0];
    } else {
      return nodos;
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