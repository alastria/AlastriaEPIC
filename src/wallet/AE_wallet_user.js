const AEL = require("../AE_library");
//AE_rootWallet
const AEW = require("./AE_wallet");
const AEA = require("./AE_alastree");
const AEU = require("../utils/AE_utils");

// DONE: addChild must check if there's a previous derivation with the same number
class AE_userWallet extends AEW.AE_rootWallet {
  constructor() {
    super();
    (this.identity_pattern = "mZRSSSSSWMTNBCDDE");
    (this.identity_last_fixed_derivation_level = "N");
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

    this.safeAddChild(this.DTree, data)
    //this.DTree.addChild(data);
    super.setIdentityDerivation(mZR_der, SSSSSW_der, MTN_der);
  }

    

  addBPlusDerivation(entityStr, derivationStr, MTN_alias) {
    // MTN updated
    if (!AEU.check_require("id_derivation", derivationStr)) {
      throw "Invalid derivation";
    }



    let networkNode = this.getNetworkNode(MTN_alias); 
    let currentMTN_der = this.getMTNDerivation();
    let relDerivation = AEU.cleanDerivation(currentMTN_der + "/" + derivationStr);

    // DONE correct bug, derivationStr lacks MTN and it is needed
    let entity_relationship_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet, relDerivation);
    let my_entity_relationship_public_key = AEL.getPublicExtendedKey(entity_relationship_wallet);

    let data = {};
    data.derivationName = "B";
    data.derivationValue = derivationStr;
    data.entity = entityStr;
    data.validStatus = true;
    data.own_HDWallet = entity_relationship_wallet;
    data.own_extendedPublicKey = my_entity_relationship_public_key;

    // DONE: It requires checking the MNT derivation to add this to      
    // let child = networkNode.addChild(data);
    let child = this.safeAddChild(networkNode, data);
    child.data.path = child.parent.data.path + "/" + child.data.derivationValue;

  }

  getBPlusLoginDerivation(entityStr, MTN_alias) {

    // Done update with MTN via getBPlusDerivation
    

    let user = this.getBPlusDerivation(entityStr,MTN_alias);
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

    if (loginDer.length == 0) {
      throw new Error("BPlusLoginDerivation has zero length");
    }

    return loginDer;
  }

  addRenewBplusLoginDerivation(entityStr, loginDerivationStr, MTN_alias) {
    // Done MTN updated

    if (!AEU.check_require("id_derivation", loginDerivationStr)) {
      throw "Invalid derivation";
    }

    // Multiple MTN
    let networkNode = this.getNetworkNode(MTN_alias); 

    // works for adding or renewing, as we won't keep the old login derivation once updated
    // MTN changes, let localBplus = this.getBPlusDerivation(entityStr);
    let allBderivations = networkNode.findChildByData("derivationName", "B");
    let localBplus = allBderivations.filter((nodo) => (nodo.data.entity == entityStr) && (nodo.data.validStatus == true))[0];
    
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
      //child = localBplus.addChild(data);
      child = this.safeAddChild(localBplus,data);
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
      // child = child.addChild(data);
      child = this.safeAddChild(child, data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;
    });

    child.objectKind = "Login";
  }

  
  renewBPlusDerivationPreserving(entityStr, newDerivationStr, MTN_alias) {

    // MTN updated via getBPlusDerivation

    if (!AEU.check_require("id_derivation", newDerivationStr)) {
      throw "Invalid derivation";
    }

    let localBplus = this.getBPlusDerivation(entityStr, MTN_alias);

    let oldDerivation = localBplus.data.derivationValue;
    // Invalidate this entity derivation
    localBplus.data.validStatus = false;

    // Preseve existing  "D" and "E" derivations, do not change them

    this.addBPlusDerivation(entityStr, newDerivationStr);

    return oldDerivation;

  }

  renewBPlusDerivation(entityStr, newDerivationStr, MTN_alias) {

    // MTN updated via getBPlusDerivation

    if (!AEU.check_require("id_derivation", newDerivationStr)) {
      throw "Invalid derivation";
    }

    let localBplus = this.getBPlusDerivation(entityStr, MTN_alias);

    let oldDerivation = localBplus.data.derivationValue;
    // Invalidate this entity derivation
    localBplus.data.validStatus = false;

    // Find the other "D" and "E" derivations and set to validStatus = false
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

  getLeafData(entityStr, MTN_alias) {
    // MNT updated via getBPlusDerivation

    let localBPlus = this.getBPlusDerivation(entityStr, MTN_alias);
    let findAllChild = localBPlus.findAllLeafs();
  }

  getCredentials(entityStr, MTN_alias) {
    // MNT updated via getLeafData

    let leafs = this.getLeafData(entityStr, MTN_alias);
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

  getPresentations(entityStr, MTN_alias) {
    // MNT updated via getLeafData

    let leafs = this.getLeafData(entityStr, MTN_alias);
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

  getOldCredentials(entityStr, oldDerivation, MTN_alias) {

    // Done MTN update via getOldBPlusDerivation
    // TO-DO ERROR HERE!
    let localOldBplus = this.getOldBPlusDerivation(entityStr, oldDerivation, MTN_alias);
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

  getOldPresentations(entityStr, oldDerivation, MTN_alias) {

    // Done MTN update via getOldBPlusDerivation

    let localOldBplus = this.getOldBPlusDerivation(entityStr, oldDerivation, MTN_alias);
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

  getBPlusDerivation(entityStr, oldDerivation = "none", MTN_alias) {

    // DONE MNT update

    let networkNode = this.getNetworkNode(MTN_alias);

    let vTree = [];
    // MTN update
    // let wTree = this.DTree.findChildByData("derivationName", "B");
    let wTree = networkNode.findChildByData("derivationName", "B");
    let fTree = wTree.filter((nodo) => nodo.data.entity == entityStr);
    if (oldDerivation == "none") {
      vTree = fTree.filter((x) => x.data.validStatus == true);
    } else {
      vTree = fTree.filter((x) => x.data.derivationValue == oldDerivation);
    }

    return vTree[0];
  }

  getOldBPlusDerivation(entityStr, oldDerivation, MTN_alias) {

    // called with three paramenters! getOldBPlusDerivation(entityStr, oldDerivation, MTN_alias);

    // Done MNT update
    let networkNode = this.getNetworkNode(MTN_alias);

    let wTree = networkNode.findChildByData("derivationName", "B");
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
    other_ext_pres_key, 
    MTN_alias
  ) {

    // Done MTN update via getBPlusDerivation

    let localBplus = this.getBPlusDerivation(entityStr, MTN_alias);
    localBplus.data.other_ext_login_key = other_ext_login_key;
    localBplus.data.other_ext_cred_key = other_ext_cred_key;
    localBplus.data.other_ext_pres_key = other_ext_pres_key;
  }

  async signLoginChallenge(entityStr, signLoginChallenge, MTN_alias) {

    // Done MTN update via getBPlusDerivation

    let connect_to_entity = this.getBPlusDerivation(entityStr, MTN_alias);
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

  verifyLoginChallenge(signerStr, challengeStr, signatureStr, MTN_alias) {
    // YET not working, review derivations of Entities and Users, that are different

    // Done MTN update via getBPlusDerivation

    let signerRl = this.getBPlusDerivation(signerStr, MTN_alias);
    return this.baseVerifyLoginChallenge(challengeStr, signatureStr, signerRl);
  }

  setObjectDerivation(entityStr, objectID, entityObjectDerivation, objectKind, MTN_alias, userCredentialDerivation) {

    // TO-DO validate that entityStr has been registered as BPlusDerivation, if not take action: create + warning? error?

  // Done MTN update via getBPlusDerivation

    if (!AEU.check_require("id_derivation", entityObjectDerivation)) {
      throw "Invalid derivation";
    }

    // TO-DO: Maybe add credential HASH?
    // TO-DO: Pending if the wallet should store the presentation itself or if it should be an storage helper
    let localBplus = this.getBPlusDerivation(entityStr, MTN_alias);

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

    // DONE apply MTN here
    let child = this.findNodeByDerivation("C", data.derivationValue, MTN_alias);
    if (typeof child == "undefined" || child.length == 0) {
      // Add one child for "0" derivation, that holds login
      data.derivationName = "C";
      data.validStatus = true;
      //child = localBplus.addChild(data);
      child = this.safeAddChild(localBplus, data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;
    }
    data.validStatus = true;

    // Add some levels for the credential, the user part are tw;
    if (userCredentialDerivation === undefined) {
      userCredentialDerivation = AEL.getRandomIntDerivation() + "/" + AEL.getRandomIntDerivation();
    }
    else {

    }
    // harcoded for testing purposes    
    // let userCredentialDerivation = "198367/2986292";
    let derivations = userCredentialDerivation.split("/").filter(x => (x.length > 0 ));
    derivations.forEach((element) => {
      data = {};
      data.derivationName = "D";
      data.derivationValue = element;
      data.validStatus = true;
      // child = child.addChild(data);
      child = this.safeAddChild(child, data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;
    });

    // Add the entity requested derivations
    derivations = entityObjectDerivation.split("/").filter(x => (x.length > 0 ));
    derivations.forEach((element) => {
      data = {};
      data.derivationName = "E";
      data.derivationValue = element;
      data.validStatus = true;      
      // child = child.addChild(data);
      child = this.safeAddChild(child, data);
      child.data.path =
        child.parent.data.path + "/" + child.data.derivationValue;
    });

    // In the last level we can store the credential info
    child.data.objectID = objectID;
    child.data.objectKind = objectKind;
    child.data.objectDerivation = AEU.cleanDerivation(userCredentialDerivation + "/" + entityObjectDerivation);
    child.data.objectUserDerivation = userCredentialDerivation;
    child.data.objectEntityDerivation = entityObjectDerivation;
    child.data.objectIssuer = entityStr;
    return child;
  }

  setCredentialDerivation(entityStr, credentialID, entityCredDerivation, MTN_alias, userCredentialDerivation) {

    if (!AEU.check_require("id_derivation", entityCredDerivation)) {
      throw "Invalid derivation";
    }

    return this.setObjectDerivation(
      entityStr,
      credentialID,
      entityCredDerivation,
      "Credential",
      MTN_alias,
      userCredentialDerivation
    );
  }

  getObjectDerivation(entityStr, objectID, MTN_alias) {

    // Done MTN via getBPlusDerivation

    // Locate the entity and the credential
    let localBplus = this.getBPlusDerivation(entityStr, MTN_alias);
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

  setObjectStatus(entityStr, objectID, validStatus = true, MTN_alias) {

    // Locate the entity and the credential
    let localBplus = this.getBPlusDerivation(entityStr, MTN_alias);
    let objectDerivation = localBplus.findChildByData("objectID", objectID);

    if (Array.isArray(objectDerivation)) {
      objectDerivation[0].data.validStatus = validStatus;
    }
    else{
      objectDerivation.data.validStatus = validStatus;
    }

    
    return validStatus;

  }

  getObjectExtendedPublicKey(entityStr, objectID, MTN_alias) {

    //DONE MTN via getObjectDerivation

    let objectDerivationStr = this.getObjectDerivation(entityStr, objectID, MTN_alias);
    let objectDerivationStrWitoutContainer = AEU.cleanDerivation(AEU.subDerivation(objectDerivationStr, 1));

    // TO-DO, BUG, Extended Public Key of an object is calculated from the entity it belongs to, not the identity_wallet
    // DONE?
    let containerEntity = this.getBPlusDerivation(entityStr);

    let containerWallet = AEL.createRO_HDWalletFromPublicExtendedKey(containerEntity.data.own_extendedPublicKey);

    let credential_wallet = AEL.getHDWalletDerivation(containerWallet,objectDerivationStrWitoutContainer);      
    let credential_pubExtKey = AEL.getPublicExtendedKey(credential_wallet);

    return credential_pubExtKey;
  }

  getCredentialExtendedPublicKey(entityStr, credentialID, MTN_alias) {
    // DONE via getObjectExtendedPublicKey

    return this.getObjectExtendedPublicKey(entityStr, credentialID,MTN_alias);
  }

  getCredentialDerivation(entityStr, credentialID, MTN_alias) {
    // DONE via getObjectDerivation
    // TO-DO, BUG, missing MTN part in derivation as the objectDerivation is returned to B level, not the required W level

    let fromEntityObjectDerivation = this.getObjectDerivation(entityStr, credentialID, MTN_alias);
    let credentialDer = AEU.cleanDerivation(this.getMTNDerivation() + "/" + fromEntityObjectDerivation);

    return credentialDer;
  }

  setPresentationDerivation(entityStr, presentationID, entityPresDerivation, MTN_alias) {
    if (!AEU.check_require("id_derivation", entityPresDerivation)) {
      throw "Invalid derivation";
    }

    return this.setObjectDerivation(
      entityStr,
      presentationID,
      entityPresDerivation,
      "Presentation",
      MTN_alias
    );
  }

  getPresentationExtendedPublicKey(entityStr, entityPresentationID, MTN_alias) {
    // DONE MTN via getObjectExtendedPublicKey

    return this.getObjectExtendedPublicKey(entityStr, entityPresentationID, MTN_alias);
  }

  getPresentationDerivation(entityStr, presentationID, MTN_alias) {

    // DONE MTN via getObjectDerivation

    let wholePath = this.getObjectDerivation(entityStr, presentationID, MTN_alias);
    // Remove B derivation path form this path because the verifier has user extPubK at B level, therefore B level shouldn't be applied (it would be twice)
    // B derivation is the first after the "m"

    let primer = wholePath.indexOf("/");
    let segundo = wholePath.indexOf("/", primer + 1);

    let derivacion =
      wholePath.substring(0, primer) + wholePath.substring(segundo);
    return derivacion;
  }

  async signPresentation(entityStr, presentationID, presentationStr, MTN_alias) {
    // Maybe create a single method for login and presentation signatures?

    let pres_entity_derivation = this.getObjectDerivation(
      entityStr,
      presentationID,
      MTN_alias
    );

    // TO-DO, BUG, missing MTN!    DONE!!!
    let full_pres_entity_derivation = AEU.cleanDerivation(this.getMTNDerivation() +  "/" + pres_entity_derivation);

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




  getEntities(MTN_alias) {

    // Done MNT update
    // Multiple MTN
    let networkNode = this.getNetworkNode(MTN_alias); 


    return networkNode.findChildByData("derivationName", "B");
  }

  revokeCurrentWallet() {

    // DONE MTN update, does not require MNT selection, W is parent of MTN

    let wNode = this.findNodeByDerivation("W");
    if (!(typeof wNode === "undefined"))
      {
      let descendants = wNode.findAllDescendants();
    

      descendants.forEach((element) => {
        // DONE: MTN levels shouldn't be set to validStatus = false
        if  (!(element.data.derivationName == "M" || element.data.derivationName == "T" || element.data.derivationName == "N"))
        {
          element.data.validStatus = false;
        }
      
      });
      wNode.validStatus = false;
    }
  

    // Listar los objetos revocado: Credenciales, Presentaciones y Login
    let entities = this.getEntities();
    // Credentials in revoked identity
    let credentials = [];
    // Presentations in revoked identity
    let presentations = [];
    let uCred = [];
    let fCred = [];
    let fPres = [];
    let pKeys = [];

    entities.forEach((element) => {
      uCred = element.findChildByData("derivationName", "E");
      fCred = uCred.filter((x) => x.data.objectKind == "Credential");
      fPres = uCred.filter((x) => x.data.objectKind == "Presentation");
      credentials.push(...fCred);
      presentations.push(...fPres);
    });

    pKeys.push(this.identity_ExtPublicKey);

    let revocations = {};
    revocations.entities = entities;
    revocations.credentials = credentials;
    revocations.presentations = presentations;
    revocations.pubKs = pKeys;

    return revocations;
  }

  generateNewIdentity(old_wallet, SSSSSW_der = "") {
    // DONE MTN update does not require MTN selecion as works at higher parent level

    // Revoke previous identity
    let revocations = this.revokeCurrentWallet();
    super.generateNewIdentity(old_wallet,SSSSSW_der);

    return revocations;
}
}

module.exports = {
  AE_userWallet: AE_userWallet,
};
