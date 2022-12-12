const AEL = require("../AE_library");
//AE_rootWallet
const AEW = require("./AE_wallet");
const AEA = require("./AE_Alastree");
const AEU = require("../utils/AE_utils");

class AE_userWallet extends AEW.AE_rootWallet {
  constructor() {
    super();

    let data = {};
    data.derivationName = "m";
    this.DTree = new AEA.AE_Alastree(data);
  }

  setIdentityDerivation(mZR_der, SSSSSW_der, MTN_der) {
    let wDerivationIdx = SSSSSW_der.lastIndexOf("/");
    let wDerivation = "";
    if (wDerivationIdx >= 0) {
      wDerivation = SSSSSW_der.substring(wDerivationIdx + 1);
    }
    let data = {};
    data.derivationName = "W";
    data.derivationValue = wDerivation;
    data.path = "m/" + data.derivationValue;
    data.validStatus = true;

    this.DTree.addChild(data);
    super.setIdentityDerivation(mZR_der, SSSSSW_der, MTN_der);
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

  addBPlusDerivation(entityStr, derivationStr) {
    if (!AEU.check_require("id_derivation", derivationStr)) {
      throw "Invalid derivation";
    }

    let entity_relationship_wallet = AEL.getHDWalletDerivation(
      this.identity_HDWallet,
      "m/" + derivationStr
    );
    let my_entity_relationship_public_key = AEL.getPublicExtendedKey(
      entity_relationship_wallet
    );

    let data = {};
    data.derivationName = "B";
    data.derivationValue = derivationStr;
    data.entity = entityStr;
    data.validStatus = true;
    data.own_HDWallet = entity_relationship_wallet;
    data.own_extendedPublicKey = my_entity_relationship_public_key;
    let wTree = this.DTree.findChildByData("derivationName", "W");
    let child = wTree[0].addChild(data);
    child.data.path = child.parent.data.path + "/" + child.data.derivationValue;
  }

  getBPlusLoginDerivation(entityStr) {
    let user = this.getBPlusDerivation(entityStr);
    let derivationNodes = user.findChildByData("derivationName", "D");
    let derivations = derivationNodes.map((x) => x.data.derivationValue);
    let loginDer = derivations.reduce(
      (accumulator, currentValue) => accumulator + "/" + currentValue,
      ""
    );
    // remove first character if "/"
    if (loginDer.charAt(0) == "/") {
      return loginDer.substring(1);
    }
    return loginDer;
  }

  addRenewBplusLoginDerivation(entityStr, loginDerivationStr) {
    if (!AEU.check_require("id_derivation", loginDerivationStr)) {
      throw "Invalid derivation";
    }
    // works for adding or renewing, as we won't keep the old login derivation once updated
    let localBplus = this.getBPlusDerivation(entityStr);

    // This updates directly the user wallet
    localBplus.data.loginDerivation = loginDerivationStr;
    let entity_login_wallet = AEL.getHDWalletDerivation(
      localBplus.data.own_HDWallet,
      "m/0/" + localBplus.data.loginDerivation
    );
    localBplus.data.loginWallet = entity_login_wallet;
    let entity_login_wallet_public_key = AEL.getPublicExtendedKey(
      localBplus.data.loginWallet
    );
    localBplus.data.loginExtendedPublicKey = entity_login_wallet_public_key;

    let data = {};

    // Cogemos la C/0 que cuelgue de Entity (localBPlus) no cualquiera
    let child;
    // child = this.findNodeByDerivation("C","0");

    let wTree = localBplus.findChildByData("derivationName", "C");
    if (wTree.length == 0) {
      child = wTree;
    }
    let fTree = wTree.filter(
      (x) => x.data.derivationValue == "0" && x.data.validStatus == true
    );
    if (Array.isArray(fTree)) {
      child = fTree[0];
    } else {
      child = fTree;
    }

    if (typeof child == "undefined" || child.length == 0) {
      // Add one child for "0" derivation, that holds login

      data.derivationName = "C";
      data.derivationValue = "0";
      data.validStatus = true;
      child = localBplus.addChild(data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;
    } else {
      // Find the other "D" derivations and set to validStatus = false
      let invalidate = child.findChildByData("derivationName", "D");
      invalidate.forEach((element) => {
        element.data.validStatus = false;
      });
    }

    // Add some levels for login derivation for that entity
    let derivations = loginDerivationStr.split("/");
    derivations.forEach((element) => {
      data = {};
      data.derivationName = "D";
      data.derivationValue = element;
      data.validStatus = true;
      child = child.addChild(data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;
    });

    child.objectKind = "Login";
  }

  renewBPlusDerivation(entityStr, newDerivationStr) {
    if (!AEU.check_require("id_derivation", newDerivationStr)) {
      throw "Invalid derivation";
    }

    let localBplus = this.getBPlusDerivation(entityStr);

    let oldDerivation = localBplus.data.derivationValue;
    // Invalidate this entity derivation
    localBplus.data.validStatus = false;

    // Find the other "D" adn "E" derivations and set to validStatus = false
    let invalidate = localBplus.findChildByData("derivationName", "D");
    invalidate.forEach((element) => {
      element.data.validStatus = false;
    });

    invalidate = localBplus.findChildByData("derivationName", "E");
    invalidate.forEach((element) => {
      element.data.validStatus = false;
    });

    this.addBPlusDerivation(entityStr, newDerivationStr);

    return oldDerivation;
  }

  getLeafData(entityStr) {
    let localBPlus = this.getBPlusDerivation(entityStr);
    let findAllChild = localBPlus.findAllLeafs();
  }

  getCredentials(entityStr) {
    let leafs = this.getLeafData(entityStr);
    let fLeafs = [];
    if (Array.isArray(leafs)) {
      fLeafs = leafs.filter((x) => x.data.objectKind == "Credential");
    } else {
      if (leafs.data.objectKind == "Credential") {
        fLeafs.push(leafs);
      }
    }

    return fLeafs;
  }

  getPresentations(entityStr) {
    let leafs = this.getLeafData(entityStr);
    let fLeafs = [];
    if (Array.isArray(leafs)) {
      fLeafs = leafs.filter((x) => x.data.objectKind == "Presentation");
    } else {
      if (leafs.data.objectKind == "Presentation") {
        fLeafs.push(leafs);
      }
    }
    return fLeafs;
  }

  getOldCredentials(entityStr, oldDerivation) {
    let localOldBplus = this.getOldBPlusDerivation(entityStr, oldDerivation);
    let leafs = localOldBplus.findAllLeafs(entityStr);
    let fLeafs = [];
    if (Array.isArray(leafs)) {
      fLeafs = leafs.filter((x) => x.data.objectKind == "Credential");
    } else {
      if (leafs.data.objectKind == "Credential") {
        fLeafs.push(leafs);
      }
    }

    return fLeafs;
  }

  getOldPresentations(entityStr, oldDerivation) {
    let localOldBplus = this.getOldBPlusDerivation(entityStr, oldDerivation);
    let leafs = localOldBplus.findAllLeafs(entityStr);
    let fLeafs = [];
    if (Array.isArray(leafs)) {
      fLeafs = leafs.filter((x) => x.data.objectKind == "Presentation");
    } else {
      if (leafs.data.objectKind == "Presentation") {
        fLeafs.push(leafs);
      }
    }

    return fLeafs;
  }

  getBPlusDerivation(entityStr, oldDerivation = "none") {
    let vTree = [];
    let wTree = this.DTree.findChildByData("derivationName", "B");
    let fTree = wTree.filter((nodo) => nodo.data.entity == entityStr);
    if (oldDerivation == "none") {
      vTree = fTree.filter((x) => x.data.validStatus == true);
    } else {
      vTree = fTree.filter((x) => x.data.derivationValue == oldDerivation);
    }

    return vTree[0];
  }

  getOldBPlusDerivation(entityStr) {
    let wTree = this.DTree.findChildByData("derivationName", "B");
    let fTree = wTree.filter(
      (nodo) =>
        nodo.data.entity == entityStr &&
        nodo.data.derivationValue == oldDerivation
    );
    return fTree[0];
  }

  updateBPlusDerivationExtendedKeys(
    entityStr,
    other_ext_login_key,
    other_ext_cred_key,
    other_ext_pres_key
  ) {
    let localBplus = this.getBPlusDerivation(entityStr);
    localBplus.data.other_ext_login_key = other_ext_login_key;
    localBplus.data.other_ext_cred_key = other_ext_cred_key;
    localBplus.data.other_ext_pres_key = other_ext_pres_key;
  }

  async signLoginChallenge(entityStr, signLoginChallenge) {
    let connect_to_entity = this.getBPlusDerivation(entityStr);
    let entity_signer_eWallet = AEL.getEthereumWalletFromPrivateKey(
      AEL.getPrivateKeyFromExtended(
        AEL.getPrivateExtendedKey(connect_to_entity.data.loginWallet)
      )
    );

    let login_challenge_signature = await AEL.signMessage(
      entity_signer_eWallet,
      signLoginChallenge
    );
    return login_challenge_signature;
  }

  verifyLoginChallenge(signerStr, challengeStr, signatureStr) {
    // YET not working, review derivations of Entities and Users, that are different

    let signerRl = this.getBPlusDerivation(signerStr);
    return this.baseVerifyLoginChallenge(challengeStr, signatureStr, signerRl);
  }

  setObjectDerivation(entityStr, objectID, entityObjectDerivation, objectKind) {
    if (!AEU.check_require("id_derivation", entityObjectDerivation)) {
      throw "Invalid derivation";
    }

    //      TODO: Maybe add credential HASH?
    // Pending if the wallet should store the presentation itself or if it should be an storage helper
    let localBplus = this.getBPlusDerivation(entityStr);

    let data = {};

    switch (objectKind) {
      case "Credential":
        data.derivationValue = "1";
        break;
      case "Presentation":
        data.derivationValue = "2";
        break;
      default:
        data.derivationValue = "UNKNOWN";
    }

    let child = this.findNodeByDerivation("C", data.derivationValue);
    if (typeof child == "undefined" || child.length == 0) {
      // Add one child for "0" derivation, that holds login
      data.derivationName = "C";
      data.validStatus = true;
      child = localBplus.addChild(data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;
    }
    data.validStatus = true;

    // Add some levels for the credential, the user part are tw;
    //let objectUserDerivationStr = AEL.getRandomIntDerivation() + "/" + AEL.getRandomIntDerivation();
    // harcoded for testing purposes
    let objectUserDerivationStr = "198367/2986292";
    let derivations = objectUserDerivationStr.split("/");
    derivations.forEach((element) => {
      data = {};
      data.derivationName = "D";
      data.derivationValue = element;
      data.validStatus = true;
      child = child.addChild(data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;
    });

    // Add the entity requested derivations
    derivations = entityObjectDerivation.split("/");
    derivations.forEach((element) => {
      data = {};
      data.derivationName = "E";
      data.derivationValue = element;
      data.validStatus = true;
      child = child.addChild(data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;
    });

    // In the last level we can store the credential info
    child.data.objectID = objectID;
    child.data.objectKind = objectKind;
    return child;
  }

  setCredentialDerivation(entityStr, credentialID, entityCredDerivation) {
    if (!AEU.check_require("id_derivation", entityCredDerivation)) {
      throw "Invalid derivation";
    }

    return this.setObjectDerivation(
      entityStr,
      credentialID,
      entityCredDerivation,
      "Credential"
    );
  }

  getObjectDerivation(entityStr, objectID) {
    // Locate the entity and the credential
    let localBplus = this.getBPlusDerivation(entityStr);
    let objectDerivation = localBplus.findChildByData("objectID", objectID);

    // Calculate the credential path up to level B
    let wholePath = objectDerivation[0].data.path;
    let objectDerivationStr =
      "m" +
      wholePath.substring(
        wholePath.lastIndexOf(localBplus.parent.data.path) +
          localBplus.parent.data.path.length
      );

    return objectDerivationStr;
  }

  getObjectExtendedPublicKey(entityStr, objectID) {
    let objectDerivationStr = this.getObjectDerivation(entityStr, objectID);

    let credential_wallet = AEL.getHDWalletDerivation(
      this.identity_HDWallet,
      objectDerivationStr
    );
    let credential_pubExtKey = AEL.getPublicExtendedKey(credential_wallet);

    return credential_pubExtKey;
  }

  getCredentialExtendedPublicKey(entityStr, credentialID) {
    return this.getObjectExtendedPublicKey(entityStr, credentialID);
  }

  getCredentialDerivation(entityStr, credentialID) {
    return this.getObjectDerivation(entityStr, credentialID);
  }

  setPresentationDerivation(entityStr, presentationID, entityPresDerivation) {
    if (!AEU.check_require("id_derivation", entityPresDerivation)) {
      throw "Invalid derivation";
    }

    return this.setObjectDerivation(
      entityStr,
      presentationID,
      entityPresDerivation,
      "Presentation"
    );
  }

  getPresentationExtendedPublicKey(entityStr, entityPresentationID) {
    return this.getObjectExtendedPublicKey(entityStr, entityPresentationID);
  }

  getPresentationDerivation(entityStr, presentationID) {
    let wholePath = this.getObjectDerivation(entityStr, presentationID);
    // Remove B derivation path form this path because the verifier has user extPubK at B level, therefore B level shouldn't be applied (it would be twice)
    // B derivation is the first after the "m"

    let primer = wholePath.indexOf("/");
    let segundo = wholePath.indexOf("/", primer + 1);

    let derivacion =
      wholePath.substring(0, primer) + wholePath.substring(segundo);
    return derivacion;
  }

  async signPresentation(entityStr, presentationID, presentationStr) {
    // Maybe create a single method for login and presentation signatures?

    let full_pres_entity_derivation = this.getObjectDerivation(
      entityStr,
      presentationID
    );
    let presentation_wallet = AEL.getHDWalletDerivation(
      this.identity_HDWallet,
      full_pres_entity_derivation
    );

    // User signs login challenge with entity_relationship_wallet_login
    // prior to that has to create an Ethereum signer wallet
    let entity_signer_eWallet = AEL.getEthereumWalletFromPrivateKey(
      AEL.getPrivateKeyFromExtended(
        AEL.getPrivateExtendedKey(presentation_wallet)
      )
    );

    let presentation_signature = await AEL.signMessage(
      entity_signer_eWallet,
      presentationStr
    );
    return presentation_signature;
  }

  readIdentityWallet(wallet) {
    // let wallet = super.readIdentityWallet();
    // As "this" object cannot be assigned we do need to reconstruct it
    this.DTree = this.DTree.addChild(wallet.DTree.descendants[0].data);
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

  getEntities() {
    return this.DTree.findChildByData("derivationName", "B");
  }

  revokeCurrentWallet() {
    let wNode = this.findNodeByDerivation("W");
    let descendants = wNode.findAllDescendants();
    descendants.forEach((element) => {
      element.data.validStatus = false;
    });
    wNode.validStatus = false;
    // TODO: Listar todo lo revocado: Credenciales, Presentaciones y Login
    let entities = this.getEntities();
    // Credentials in revoked identity
    let credentials = [];
    // Presentations in revoked identity
    let presentations = [];
    let uCred = [];
    let fCred = [];
    let fPres = [];

    entities.forEach((element) => {
      uCred = element.findChildByData("derivationName", "E");
      fCred = uCred.filter((x) => x.data.objectKind == "Credential");
      fPres = uCred.filter((x) => x.data.objectKind == "Presentation");
      credentials.push(...fCred);
      presentations.push(...fPres);
    });

    let revocations = {};
    revocations.entities = entities;
    revocations.credentials = credentials;
    revocations.presentations = presentations;

    return revocations;
  }
}

module.exports = {
  AE_userWallet: AE_userWallet,
};
