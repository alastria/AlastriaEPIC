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

        // 20221122 for Alastree data structure
        let wTree = this.DTree.findChildByData("derivationName","B");
        let fTree = wTree.filter( nodo => nodo.data.entity == entityStr );

        let data = {};            
        data.derivationName = "C";
        data.derivationValue = "0";        
        data.validStatus = true;
        let child = fTree[0].addChild(data);
        child.data.path = child.parent.data.path + "/" + child.data.derivationValue;

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


    setCredentialDerivation(entityStr,credentialID,entityCredDerivation)
    {
        //  credential_derivations: array of objects where we do have each FOR each credential from that entity:
        //      id
        //      usr_derivation_part
        //      entity_derivation_part
        //      extPublicKey
        //      TODO: Maybe add credential HASH?
        //
        // Pending if the wallet should store the presentation itself or if it should be an storage helper
        let localBplus = this.getBPlusDerivation(entityStr);
        //let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let credential_meta_info = {};
        credential_meta_info.id = credentialID;
        
        // It is necessary to store the original BPlus derivation for the credential because we may rotate the entity derivation for
        // security reasons but without having to re-issue all the credentials
        // TODO: see other changes needed like get credential derivation for chain of trust
        credential_meta_info.entity_BPlus_derivation = localBplus.B_derivation;
        // this are two derivation levels, random (those may be passed as arguments so the device wallet decides instead of the library)
        // refers to EE derivation pattern
        credential_meta_info.usr_derivation_part = AEL.getRandomIntDerivation() + "/" + AEL.getRandomIntDerivation();
        credential_meta_info.usr_derivation_part = "810906238/253622342";        
        credential_meta_info.entity_derivation_part = entityCredDerivation;   
        localBplus.credential_derivations.push(credential_meta_info);
        
        //this.Bplus_derivation[localBplusIdx] = localBplus;
        
    }

    getCMeta(localBplus, credentialID){

        return localBplus.credential_derivations.find(element => element.id === credentialID);
    }

    getPMeta(localBplus, presentationID){

        return localBplus.presentation_derivations.find(element => element.id === presentationID);
    }

    getCredentialExtendedPublicKey(entityStr, credentialID)
    {
        // The ExtendedPublicKey to be used in the DID for emitting this credential

        let localBplus = this.getBPlusDerivation(entityStr);
        //let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let localCMeta = this.getCMeta(localBplus,credentialID);
        let localCMetaIdz = localBplus.credential_derivations.findIndex(element => element.id === credentialID); 

        let full_credential_derivation = localCMeta.usr_derivation_part + "/" + localCMeta.entity_derivation_part;
        let full_cred_entity_derivation = "m/" + localBplus.B_derivation + "/1/" + full_credential_derivation;

        let credential_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet,full_cred_entity_derivation);
        let credential_pubExtKey = AEL.getPublicExtendedKey(credential_wallet);

        localCMeta.extPublicKey = credential_pubExtKey;
        localBplus.credential_derivations[localCMetaIdz] = localCMeta;

        //this.Bplus_derivation[localBplusIdx] = localBplus;

        return credential_pubExtKey;

    }

    getCredentialDerivation(entityStr, credentialID)
    {

        let localBplus = this.getBPlusDerivation(entityStr);
        let localCMeta = this.getCMeta(localBplus,credentialID);
        // Instead of using localBplus.B_derivation that is the CURRENT B derivation for that entity we will have 
        // to use the original B derivation, that was stored in Entity_interacting_derivation
        let full_presentation_derivation = "m/" + localCMeta.entity_BPlus_derivation + "/1/" + localCMeta.usr_derivation_part + "/" + localCMeta.entity_derivation_part;
        return full_presentation_derivation;

    }

    setPresentationDerivation (entityStr,presentationID,entityPresDerivation) {
        //  presentation_derivations: array of objects where we do have each FOR each credential of that entity:
        //      id
        //      usr_derivation_part
        //      entity_derivation_part        
        //      extPublicKey
        //      TODO: Maybe add presentation HASH?
        //
        // Pending if the wallet should store the presentation itself or if it should be an storage helper
        let localBplus = this.getBPlusDerivation(entityStr);
        //let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let presentation_meta_info = {};
        presentation_meta_info.id = presentationID;
        // presentations should also store the original B derivation of the presentation for the deletion purposes
        presentation_meta_info.entity_BPlus_derivation = localBplus.B_derivation;

        // this are two derivation levels, random (those may be passed as arguments so the device wallet decides instead of the library)
        presentation_meta_info.usr_derivation_part = AEL.getRandomIntDerivation() + "/" + AEL.getRandomIntDerivation();
        presentation_meta_info.usr_derivation_part = "192572143/423682035";        
        presentation_meta_info.entity_derivation_part = entityPresDerivation;   
        localBplus.presentation_derivations.push(presentation_meta_info);
        
        //this.Bplus_derivation[localBplusIdx] = localBplus;

    }

    getPresentationExtendedPublicKey(entityStr, presentationID)
    {

        let localBplus = this.getBPlusDerivation(entityStr);
        //let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let localPMeta = this.getPMeta(localBplus,presentationID);
        let localPMetaIdz = localBplus.presentation_derivations.findIndex(element => element.id === presentationID); 

        let full_presentation_derivation = localPMeta.usr_derivation_part + "/" + localPMeta.entity_derivation_part;

        // Instead of using localBplus.B_derivation that is the CURRENT B derivation for that entity we will have 
        // to use the original B derivation, that was stored in Entity_interacting_derivation
        let full_cred_entity_derivation = "m/" + localPMeta.entity_BPlus_derivation + "/2/" + full_presentation_derivation;

        let presentation_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet,full_cred_entity_derivation);
        let presentation_pubExtKey = AEL.getPublicExtendedKey(presentation_wallet);

        localPMeta.extPublicKey = presentation_pubExtKey;
        localBplus.presentation_derivations[localPMetaIdz] = localPMeta;

        //this.Bplus_derivation[localBplusIdx] = localBplus;

        return presentation_pubExtKey;

    }

    getPMeta(localBplus, presentationID){

        return localBplus.presentation_derivations.find(element => element.id === presentationID);
    }

    getPresentationDerivation(entityStr, presentationID)
    {

        let localBplus = this.getBPlusDerivation(entityStr);
        let localPMeta = this.getPMeta(localBplus,presentationID);
        // Omit localBplus.B_derivation because the SP will derive from the pubK he already knows I sent him that is the localBplus.B_derivation
        let full_presentation_derivation = "m/" + "2/" + localPMeta.usr_derivation_part + "/" + localPMeta.entity_derivation_part;
        return full_presentation_derivation;

    }



    async signPresentation (entityStr, presentationID, presentationStr) {
        // Maybe create a single method for login and presentation signatures?

        let localBplus = this.getBPlusDerivation(entityStr);
        // let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let localCMeta = this.getPMeta(localBplus,presentationID);
        // let localCMetaIdz = localBplus.presentation_derivations.findIndex(element => element.id === presentationID); 

        let full_presentation_derivation = localCMeta.usr_derivation_part + "/" + localCMeta.entity_derivation_part;
        let full_pres_entity_derivation = "m/" + localBplus.B_derivation + "/2/" + full_presentation_derivation;

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