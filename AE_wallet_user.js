const AEL = require ("./AE_libray");
//AE_rootWallet
const AEW = require ("./AE_wallet");
const AEWS = require ("./AE_wallet_storage");
const AEA = require("./AE_Alastree");


class AE_userWallet extends AEW.AE_rootWallet{
    constructor() {
        super();

        // 20221122 new tree data structure                
        // DTree should start at level "W" so it can hold "revoked identities"
        let data ={};
        data.derivationName = "m";
        this.DTree = new AEA.AE_Alastree(data);
        this.walletRecoveryFile = "./User_Recovery_wallet.txt"

    }

    setIdentityDerivation (mZR_der, SSSSSW_der, MTN_der)  {
        
        let wDerivationIdx = SSSSSW_der.lastIndexOf("/");
        let wDerivation = "";
        if (wDerivationIdx >= 0) {
            wDerivation = SSSSSW_der.substring(wDerivationIdx+1);            
        }
        let data = {};
        data.derivationName = "W";
        data.derivationValue = wDerivation;
        data.path = "m/" + data.derivationValue;
        data.validStatus = true;

        this.DTree.addChild(data);
        super.setIdentityDerivation(mZR_der, SSSSSW_der, MTN_der);

    }

    findNodeByDerivation(derivationName, derivationValue) {
        
        let wTree = this.DTree.findChildByData("derivationName",derivationName);
        if (wTree.length == 0) {
            return wTree;        
        }
        let fTree = wTree.filter(x => (x.data.derivationValue == derivationValue && x.data.validStatus == true));
        if (Array.isArray(fTree)) {
            return fTree[0];
        }
        else {
            return fTree;
        }
    }

    addBPlusDerivation (entityStr, derivationStr) { 

        let entity_relationship_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet , "m/" + derivationStr);
        let my_entity_relationship_public_key = AEL.getPublicExtendedKey(entity_relationship_wallet);
        
        let data = {};
        data.derivationName = "B";
        data.derivationValue = derivationStr;
        data.entity = entityStr;
        data.validStatus = true;
        data.own_HDWallet = entity_relationship_wallet;
        data.own_extendedPublicKey = my_entity_relationship_public_key;
        let wTree = this.DTree.findChildByData("derivationName","W")
        let child = wTree[0].addChild(data);
        child.data.path = child.parent.data.path + "/" + child.data.derivationValue;
    }



    addRenewBplusLoginDerivation(entityStr, loginDerivationStr) {

        // works for adding or renewing, as we won't keep the old login derivation once updated
        let localBplus = this.getBPlusDerivation(entityStr);

        // This updates directly the user wallet
        localBplus.data.loginDerivation = loginDerivationStr;
        let entity_login_wallet = AEL.getHDWalletDerivation(localBplus.data.own_HDWallet, "m/0/"+ localBplus.data.loginDerivation);
        localBplus.data.loginWallet = entity_login_wallet;
        let entity_login_wallet_public_key = AEL.getPublicExtendedKey(localBplus.data.loginWallet);
        localBplus.data.loginExtendedPublicKey = entity_login_wallet_public_key;

        let data = {};   

        let child = this.findNodeByDerivation("C","0");
        if ((typeof child == 'undefined') || child.length == 0) {
            // Add one child for "0" derivation, that holds login
                     
            data.derivationName = "C";
            data.derivationValue = "0";        
            data.validStatus = true;        
            child = localBplus.addChild(data);        
            child.data.path = child.parent.data.path + "/" + child.data.derivationValue;

        }      

        // Add some levels for login derivation for that entity
        let derivations = loginDerivationStr.split("/");
        derivations.forEach(element => {
            data = {};
            data.derivationName = "D";
            data.derivationValue = element;
            data.validStatus = true;
            child = child.addChild(data);
            child.data.path = child.parent.data.path + "/" + child.data.derivationValue;
        });       
        
    }

    renewBPlusDerivation (entityStr, newDerivationStr) {
        let localBplus = this.getBPlusDerivation(entityStr);
        
        let oldDerivation = localBplus.B_derivation;        
        
        localBplus.data.validStatus = false;
        this.addBPlusDerivation(entityStr,newDerivationStr);

        return oldDerivation;

    }

    getOldCredentials(entityStr) {
        let localOldBplus = this.getOldBPlusDerivation(entityStr);
        //let localOldBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr);   
        
        return localOldBplus.credential_derivations;
    }

    getOldPresentations(entityStr) {
        let localOldBplus = this.getOldBPlusDerivation(entityStr);
        //let localOldBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr);   
        
        return localOldBplus.presentation_derivations;
    }


    getBPlusDerivation (entityStr) {        
        //return this.Bplus_derivation.find(element => element.entity === entityStr);
        let wTree = this.DTree.findChildByData("derivationName","B");
        let fTree = wTree.filter( nodo => nodo.data.entity == entityStr );
        return fTree[0];

    }

    getOldBPlusDerivation(entityStr) {        
        return this.Old_Bplus_derivation.find(element => element.entity === entityStr);
    }

    updateBPlusDerivationExtendedKeys (entityStr, other_ext_login_key, other_ext_cred_key, other_ext_pres_key) {

        let localBplus = this.getBPlusDerivation(entityStr);        
        localBplus.data.other_ext_login_key = other_ext_login_key;
        localBplus.data.other_ext_cred_key = other_ext_cred_key;
        localBplus.data.other_ext_pres_key = other_ext_pres_key;

    }


    async signLoginChallenge (entityStr, signLoginChallenge)
    {        

        let connect_to_entity = this.getBPlusDerivation(entityStr);
        let entity_signer_eWallet = 
            AEL.getEthereumWalletFromPrivateKey(
                AEL.getPrivateKeyFromExtended(
                    AEL.getPrivateExtendedKey(connect_to_entity.data.loginWallet)
                )
            );

        let login_challenge_signature = await AEL.signMessage(entity_signer_eWallet, signLoginChallenge);
        return login_challenge_signature;
    }

    verifyLoginChallenge (signerStr, challengeStr, signatureStr){
        // YET not working, review derivations of Entities and Users, that are different

        let signerRl = this.getBPlusDerivation(signerStr);
        return this.baseVerifyLoginChallenge(challengeStr,signatureStr,signerRl)

    }

    setObjectDerivation(entityStr,objectID, entityObjectDerivation, objectKind)
    {
        //      TODO: Maybe add credential HASH?
        // Pending if the wallet should store the presentation itself or if it should be an storage helper
        let localBplus = this.getBPlusDerivation(entityStr);

        let data = {};            
                
        switch (objectKind) {
            case 'Credential':
                data.derivationValue = "1";  
                break;
            case 'Presentation':
                data.derivationValue = "2";  
                break;
            default:
                data.derivationValue = "UNKNOWN";

        }

        let child = this.findNodeByDerivation("C",data.derivationValue);
        if ((typeof child == 'undefined') || child.length == 0) {
            // Add one child for "0" derivation, that holds login                
            data.derivationName = "C";
            data.validStatus = true;        
            child = localBplus.addChild(data);        
            child.data.path = child.parent.data.path + "/" + child.data.derivationValue;

        }     
        data.validStatus = true;        

        // Add some levels for the credential, the user part are tw;
        //let objectUserDerivationStr = AEL.getRandomIntDerivation() + "/" + AEL.getRandomIntDerivation();
        // harcoded for testing purposes
        let objectUserDerivationStr = "198367/2986292";
        let derivations = objectUserDerivationStr.split("/");
        derivations.forEach(element => {
            data = {};
            data.derivationName = "D";
            data.derivationValue = element;
            data.validStatus = true;
            child = child.addChild(data);
            child.data.path = child.parent.data.path + "/" + child.data.derivationValue;
        }); 

        // Add the entity requested derivations
        derivations = entityObjectDerivation.split("/");
        derivations.forEach(element => {
            data = {};
            data.derivationName = "E";
            data.derivationValue = element;
            data.validStatus = true;
            child = child.addChild(data);
            child.data.path = child.parent.data.path + "/" + child.data.derivationValue;
        }); 

        // In the last level we can store the credential info
        child.data.objectID = objectID;
        child.data.objectKind = objectKind;
        return child;


    }


    setCredentialDerivation(entityStr,credentialID,entityCredDerivation)
    {
        return this.setObjectDerivation(entityStr,credentialID,entityCredDerivation, "Credential");
    }

    getObjectDerivation(entityStr, objectID) {

        // Locate the entity and the credential
        let localBplus = this.getBPlusDerivation(entityStr);
        let objectDerivation = localBplus.findChildByData("objectID",objectID);
        
        // Calculate the credential path up to level B
        let wholePath = objectDerivation[0].data.path;
        let objectDerivationStr = "m"+ wholePath.substring(wholePath.lastIndexOf(localBplus.parent.data.path)+localBplus.parent.data.path.length);

        return objectDerivationStr;
        
    }

    getObjectExtendedPublicKey(entityStr, objectID) {
        
        let objectDerivationStr = this.getObjectDerivation(entityStr, objectID);
    
        let credential_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet,objectDerivationStr);
        let credential_pubExtKey = AEL.getPublicExtendedKey(credential_wallet);

        return credential_pubExtKey;

    }

    getCredentialExtendedPublicKey(entityStr, credentialID)
    {

        return this.getObjectExtendedPublicKey(entityStr, credentialID);

    }

    getCredentialDerivation(entityStr, credentialID)
    {
        return this.getObjectDerivation(entityStr,credentialID);

    }

    setPresentationDerivation (entityStr,presentationID,entityPresDerivation) {

        return this.setObjectDerivation(entityStr,presentationID,entityPresDerivation, "Presentation");

    }

    getPresentationExtendedPublicKey(entityStr, entityPresentationID)
    {

        return this.getObjectExtendedPublicKey(entityStr,entityPresentationID);


    }

    getPresentationDerivation(entityStr, presentationID)
    {
        let wholePath = this.getObjectDerivation(entityStr, presentationID);
        // Remove B derivation path form this path because the verifier has user extPubK at B level, therefore B level shouldn't be applied (it would be twice)
        // B derivation is the first after the "m"

        let primer = wholePath.indexOf("/");
        let segundo = wholePath.indexOf("/", primer+1);

        let derivacion = wholePath.substring(0,primer)+wholePath.substring(segundo);
        return derivacion;

        return this.getObjectDerivation(entityStr, presentationID);

        

    }



    async signPresentation (entityStr, presentationID, presentationStr) {
        // Maybe create a single method for login and presentation signatures?

        let full_pres_entity_derivation = this.getObjectDerivation(entityStr,presentationID);
        let presentation_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet,full_pres_entity_derivation);


        // User signs login challenge with entity_relationship_wallet_login
        // prior to that has to create an Ethereum signer wallet
        let entity_signer_eWallet = 
            AEL.getEthereumWalletFromPrivateKey(
                AEL.getPrivateKeyFromExtended(
                    AEL.getPrivateExtendedKey(presentation_wallet)
                )
            );

        let presentation_signature = await AEL.signMessage(entity_signer_eWallet, presentationStr);
        return presentation_signature;

    }

    readIdentityWallet () {
        let wallet = AEWS.readIdentityWallet(this.walletStoreFile);

        this.Bplus_derivation = wallet.Bplus_derivation;
        this.Old_Bplus_derivation = wallet.Old_Bplus_derivation;
        super.readIdentityWallet();

    }

}


module.exports = {
    AE_userWallet: AE_userWallet
}