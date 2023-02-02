const AEL = require("../AE_library");
const AEW = require("./AE_wallet");
const AEA = require("./AE_alastree");
const { id } = require("ethers/lib/utils");
const AEU = require("../utils/AE_utils");
const AEC = require("../utils/AE_constants");

// DONE: addChild must check if there's a previous derivation with the same number

class AE_entityWallet extends AEW.AE_rootWallet {
  constructor() {
    super();   
    (this.identity_pattern = "mZRSSSSSWMTNCDDE");    
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

    // Here we do not need to check if there was an exiting child with the same derivation as it is the first identity child
    let firstChild = this.safeAddChild(this.DTree, data);
    // let firstChild = this.DTree.addChild(data);
    super.setIdentityDerivation(mZR_der, SSSSSW_der, MTN_der);
    
    // This corresponds to C derivations aka Purpose
    // 0 -> login, may be usefull for C2C interactions or to sign login challenges
    data.login_derivation = "m/0";
    data.login_HDWallet = AEL.getHDWalletDerivation(
      this.identity_HDWallet,
      data.login_derivation
    );
    data.login_extPublicKey = AEL.getPublicExtendedKey(data.login_HDWallet);

    // 1 -> credencial issuance
    data.credencialIssuance_derivation = "m/1";
    data.credentialIssuance_HDWallet = AEL.getHDWalletDerivation(
      this.identity_HDWallet,
      data.credencialIssuance_derivation
    );
    data.credencialIssuance_extPublicKey = AEL.getPublicExtendedKey(
      data.credentialIssuance_HDWallet
    );

    // 2 -> presentations
    data.presentations_derivation = "m/2";
    data.presentations_HDWallet = AEL.getHDWalletDerivation(
      this.identity_HDWallet,
      data.presentations_derivation
    );
    data.presentations_extPublicKey = AEL.getPublicExtendedKey(
      data.presentations_HDWallet
    );

    firstChild.data = data;
    
  }

  addCPlusDerivation(entityStr, MTN_alias) {

    // Done  MTN changes, using getNetworkNode
    let localCPD = this.getNetworkNode(MTN_alias); 
  
    let data = {};
    data.entity = entityStr;
    data.derivationName = "C";
    data.validStatus = true;

    // let currentCPD = localCPD.addChild(data);
    let currentCPD = this.safeAddChild(localCPD, data);
    // 20221123: as user do not get derivations for Entities the Path will have the name here
    currentCPD.data.path = currentCPD.parent.data.path + "/" + entityStr;
    return currentCPD;
  }

  getCPlusDerivation(entityStr, MTN_alias) {

    // DOne MTN changes, DONE test
    let localCPD = this.getNetworkNode(MTN_alias);

    let wTree = localCPD.findChildByData("derivationName", "C");
    let fTree = wTree.filter(
      (nodo) => nodo.data.entity == entityStr && nodo.data.validStatus == true
    );
    if (Array.isArray(fTree)) {
      return fTree[0];
    } else {
      return fTree;
    }
  }

  getDerivation(derivationName, MTN_alias) {

    // Done MTN changes
    // DONE when asking for W derivations MTN phase should be avoided because it is deeper in the tree and has not W
    let localDer;

    if (derivationName == "W")
    {
      localDer = this.DTree;
    }
    else
    {
      localDer = this.getNetworkNode(MTN_alias);
    }
    

    //return this.Bplus_derivation.find(element => element.entity === entityStr);
    let wTree = localDer.findChildByData("derivationName", derivationName);
    let fTree = wTree.filter((nodo) => nodo.data.validStatus == true);
    return fTree[0];
  }

  updateCPlusDerivationExtendedKeys(userStr, other_extendedKey, MTN_alias) {

    // Done MTN changes via getCPlusDerivation

    let localCplus = this.getCPlusDerivation(userStr, MTN_alias);
    //let localCplusIdx = this.Cplus_derivation.findIndex(element => element.entity === userStr);

    localCplus.data.other_extendedPublicKey = other_extendedKey;
    //this.Cplus_derivation[localCplusIdx] = localCplus;
  }

  addRenewCplusLoginDerivation(userStr, loginDerivationStr, MTN_alias ) {
    // Done MNT update via getDerivation update

    // works for adding or renewing
    let localCplus = this.getDerivation("C", MTN_alias);
    let child;
    // Check is it is an array to see the userStr
    if (Array.isArray(localCplus)) {
      child = localCplus.filter((x) => x.data.entity == userStr);
    } else {
      if (localCplus.data.entity == userStr) {
        child = localCplus;
      }
    }

    // revoke older derivations for this userStr
    // Find the other "D" derivations and set to validStatus = false
    let invalidate = child.findChildByData("derivationName", "D");
    invalidate.forEach((element) => {
      element.data.validStatus = false;
    });

    let data = {};
    let derivations = loginDerivationStr.split("/").filter( x => (x.length >0));
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

    child.data.objectKind = AEC.login;

    return child;
  }

  getLoginDerivation(userStr, MTN_alias) {
    // MTN done via getCPlusDerivation

    // DONE, this generates an error when the user has old login derivations, must re-code, avoid reduce
    let user = this.getCPlusDerivation(userStr, MTN_alias);
    let loginNodes = user.findAllLeafs();
    let fLoginNodes = loginNodes.filter( x => (x.data.objectKind == AEC.login && x.data.validStatus == true))
    let loginDer = AEU.substractDerivations(user.data.path, fLoginNodes[0].data.path).substring(1);

    return loginDer;
  }

  setObjectDerivation(userStr, objectID, userDerivation, entityDerivation, objectKind, MTN_alias) {

    // DOne MTN update via getDerivation
    
    let cUD = AEU.cleanPath(userDerivation);
    let cED = AEU.cleanPath(entityDerivation);

    let data = {};
    let localCplus = this.getDerivation("C", MTN_alias);
    let child;
    // Check is it is an array to see the userStr
    if (Array.isArray(localCplus)) {
      child = localCplus.filter((x) => x.data.entity == userStr);
    } else {
      if (localCplus.data.entity == userStr) {
        child = localCplus;
      }
    }
    
    // Add the user requested derivations
    let derivations = cUD.split("/").filter(x => (x.length > 0 ));
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
    derivations = cED.split("/").filter(x => (x.length > 0 ));
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
    child.data.objectUserDerivation = userDerivation;
    child.data.objectEntityDerivation = entityDerivation;

    return child;


  }

  setCredentialInfo(userStr, credentialID, userExtPubK, userDerivation, entityDerivation, MTN_alias) {

    // DONE MTN update via setObjectDerivation

    let child = this.setObjectDerivation(userStr, credentialID, userDerivation, entityDerivation, AEC.credential, MTN_alias);
    child.data.userExtPubK = userExtPubK;

    return child;
    
  }

  setPresentationInfo(userStr, credentialID, userExtPubK, userDerivation, entityDerivation, MTN_alias) {

    // DONE MTN update via setObjectDerivation

    let child = this.setObjectDerivation(userStr, credentialID, userDerivation, entityDerivation, AEC.presentation, MTN_alias);
    child.data.userExtPubK = userExtPubK;

    return child;

  }

  async signLoginChallenge(entityStr, signLoginChallenge) {
    // TODO: this should be similar to user signature?
    // DISCUSS

    return;
  }

  verifyLoginChallenge(signerStr, challengeStr, signatureStr, MTN_alias) {
    // DONE MTN update via getCPlusDerivation

    let signerRl = this.getCPlusDerivation(signerStr, MTN_alias);
    let login_derivation = this.getLoginDerivation(signerStr, MTN_alias);
    return this.baseVerifyLoginChallenge(
      challengeStr,
      signatureStr,
      signerRl.data.other_extendedPublicKey,
      login_derivation
    );
  }

  getHDWalletByPurpose(purpose, MTN_alias) {

    // DOne MTN update vida getDerivation

    let identityW = this.getDerivation("W", MTN_alias);
    let fIdentityW = identityW;
    if (Array.isArray(identityW)) {
      fIdentityW = identityW.filter((x) => x.data.validStatus == true);
    }

    let peK = fIdentityW.data[purpose];
    return peK;
  }

  async signCredential(credentialStr, MTN_alias) {
    // When a company signs a credential it is independent of the subject that credential is created for
    // this makes easier to verify the credential signtature by the receiver of that credential
    // DISCUSS

    // DONE MTN update via gtHDWalletByPurpose

    let peK = this.getHDWalletByPurpose("credentialIssuance_HDWallet", MTN_alias);

    let signature = AEL.signMessage(
      AEL.getEthereumWalletFromPrivateKey(
        AEL.getPrivateKeyFromExtended(AEL.getPrivateExtendedKey(peK))
      ),
      credentialStr
    );
    return signature;
  }

  verifyPresentationSignature(
    userStr,
    presentation_derivationStr,
    credential_setStr,
    credential_setSignatureStr, 
    MTN_alias
  ) {


    // Done MTN update via getCPlusDerivation

    let localCplus = this.getCPlusDerivation(userStr, MTN_alias);
    let user_Cplus_Wallet = AEL.createRO_HDWalletFromPublicExtendedKey(
      localCplus.data.other_extendedPublicKey
    );
    let user_presentation_wallet = AEL.getHDWalletDerivation(
      user_Cplus_Wallet,
      presentation_derivationStr
    );
    return AEL.verifyMessageByPublicExtendedKey(
      credential_setStr,
      credential_setSignatureStr,
      AEL.getPublicExtendedKey(user_presentation_wallet)
    );
  }

  verifyChainOfTrust(
    user_base_identity_pubK,
    cred_der_set,
    credential_pubK_set
  ) {
    let result = true;

    let user_Cplus_Wallet = AEL.createRO_HDWalletFromPublicExtendedKey(
      user_base_identity_pubK
    );
    let cred_derived_pubK_array = [];
    i = 0;
    cred_der_set.forEach((element) => {
      let cred_derived_pubK = AEL.getPublicExtendedKey(
        AEL.getHDWalletDerivation(user_Cplus_Wallet, cred_der_set[i])
      );
      cred_derived_pubK_array.push(cred_derived_pubK);
      i++;
    });

    i = 0;
    cred_derived_pubK_array.every((element) => {
      if (!(element === credential_pubK_set[i])) {        
        // console.log("ERROR validating Chain Of Trust for credentials");
        result = false;
      }
      i++;
    });

    //if (result) {
    // console.log("Validation Chain Of Trust for credentials CORRECT");
    //}

    // This requires later validation of user_base_identity_pubK in the blockchain network in case it has been revoked by the user

    return result;
  }

  getPurposePublicKey(purpose) {

    // DONE MTN, does not require MTN as W is parent of MTN

    let fIdentityW;
    if (purpose == "identity_ExtPublicKey") {
      return this.identity_ExtPublicKey;
    } else {
      let identityW = this.getDerivation("W");
      fIdentityW = identityW;
      if (Array.isArray(identityW)) {
        fIdentityW = identityW.filter((x) => x.data.validStatus == true);
      }
    }

    return fIdentityW.data[purpose];
  }


  getSubjects(MTN_alias) {

    // DONE MTN update
    let networkNode = this.getNetworkNode(MTN_alias);

    return networkNode.findChildByData("derivationName", "C");
  }


  revokeCurrentWallet() {

    // DONE MTN update, W level is parent of MTN, does not require MTN selection

    let wNode = this.findNodeByDerivation("W");

    // Listar lo revocado: Credenciales, Presentaciones y Login
    let subjects = this.getSubjects();    
    // Credentials in revoked identity
    let credentials = [];
    // Presentations in revoked identity
    let presentations = [];
    // Logins in revoked identity
    let logins = [];
    let uCred = [];
    let fCred = [];
    let fPres = [];
    let fLog = [];

    // Los login no tienen derivación "E", en vez de buscar por "derivationName" habría que buscar los diferentes objectKind que se deberían revocar
    subjects.forEach((element) => {      

      fCred = element.findChildByData("objectKind",AEC.credential).filter( x => ( x.data.validStatus == true));
      fPres = element.findChildByData("objectKind",AEC.presentation).filter( x => ( x.data.validStatus == true));
      fLog = element.findChildByData("objectKind",AEC.login).filter( x => ( x.data.validStatus == true));

      credentials.push(...fCred);
      presentations.push(...fPres);
      logins.push(...fLog);
    });

    // Finally revoke everything
    if (!(typeof wNode === "undefined"))
    {
    let descendants = wNode.findAllDescendants();
    descendants.forEach((element) => {
    element.data.validStatus = false;
    });
    wNode.validStatus = false;
  }



    let revocations = {};    
    revocations.credentials = credentials;
    revocations.presentations = presentations;
    revocations.logins = logins;

    return revocations;
  }



  generateNewIdentity(old_wallet, SSSSSW_der = "") {

    // DONE MTN update, does not require MTN selection as works at higher levels

      // Revoke previous identity
      let revocations = this.revokeCurrentWallet();

      super.generateNewIdentity(old_wallet,SSSSSW_der);

      return revocations;
  }

}

module.exports = {
  AE_entityWallet: AE_entityWallet,
};
