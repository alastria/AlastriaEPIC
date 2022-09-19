const AEL = require ("./AE_libray");
//AE_rootWallet
const AEW = require ("./AE_wallet");


class AE_userWallet extends AEW.AE_rootWallet{
    constructor() {
        super();

        // B_derivation fields:
        //  entity: the entity for which this derivation is intented
        //  B_derivation: the selected derivation
        //  own_HDWallet: pre-generated HDWallet for relationships with that entity
        //  own_extendedPublicKey: pre-generated public extended key of this user with that entity
        //  credential_derivations: array of objects where we do have each FOR each credential of that entity:
        //      id
        //      usr_derivation_part
        //      entity_derivation_part
        //  
        this.Bplus_derivation = []


    }
    addBPlusDerivation (entityStr, derivationStr) { 
        let localBPD = {};


        localBPD.entity = entityStr;
        localBPD.B_derivation = derivationStr; 

        // new, to do most things in a single point
        let entity_relationship_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet , "m/" + localBPD.B_derivation);
        localBPD.own_HDWallet = entity_relationship_wallet;
        let my_entity_relationship_public_key = AEL.getPublicExtendedKey(entity_relationship_wallet);
        localBPD.own_extendedPublicKey = my_entity_relationship_public_key;

        localBPD.credential_derivations = [];
        localBPD.presentation_derivations = [];

        this.Bplus_derivation.push(localBPD);


    }
    getBPlusDerivation (entityStr) {        
        return this.Bplus_derivation.find(element => element.entity === entityStr);
    }

    updateBPlusDerivationExtendedKeys (entityStr, other_extendedKey) {

        let localBplus = this.getBPlusDerivation(entityStr);
        let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr);         
        localBplus.other_extendedPublicKey = other_extendedKey;
        this.Bplus_derivation[localBplusIdx] = localBplus;
    }

    async signLoginChallenge (entityStr, signLoginChallenge)
    {

        let connect_to_entity = this.getBPlusDerivation(entityStr);
        let entity_relationship_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet , "m/" + connect_to_entity.B_derivation);
        // User will create an HDWallet for his communications with the entity
        // common knowledge: "/0" will be the standar derivation for "login" for the user (note: not for entities)
        let entity_relationship_wallet_login = AEL.getHDWalletDerivation(entity_relationship_wallet, "m/0");
        // User signs login challenge with entity_relationship_wallet_login
        // prior to that has to create an Ethereum signer wallet
        let entity_signer_eWallet = 
            AEL.getEthereumWalletFromPrivateKey(
                AEL.getPrivateKeyFromExtended(
                    AEL.getPrivateExtendedKey(entity_relationship_wallet_login)
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
        //  credential_derivations: array of objects where we do have each FOR each credential of that entity:
        //      id
        //      usr_derivation_part
        //      entity_derivation_part
        //      extPublicKey
        let localBplus = this.getBPlusDerivation(entityStr);
        let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let credential_meta_info = {};
        credential_meta_info.id = credentialID;
        // this are two derivation levels, random (those may be passed as arguments so the device wallet decides instead of the library)
        credential_meta_info.usr_derivation_part = AEL.getRandomIntDerivation() + "/" + AEL.getRandomIntDerivation();
        credential_meta_info.usr_derivation_part = "810906238/253622342";        
        credential_meta_info.entity_derivation_part = entityCredDerivation;   
        localBplus.credential_derivations.push(credential_meta_info);
        
        this.Bplus_derivation[localBplusIdx] = localBplus;
        
    }

    getCMeta(localBplus, credentialID){

        return localBplus.credential_derivations.find(element => element.id === credentialID);
    }

    getPMeta(localBplus, presentationID){

        return localBplus.presentation_derivations.find(element => element.id === presentationID);
    }

    getCredentialExtendedPublicKey(entityStr, credentialID)
    {

        let localBplus = this.getBPlusDerivation(entityStr);
        let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let localCMeta = this.getCMeta(localBplus,credentialID);
        let localCMetaIdz = localBplus.credential_derivations.findIndex(element => element.id === credentialID); 

        let full_credential_derivation = localCMeta.usr_derivation_part + "/" + localCMeta.entity_derivation_part;
        let full_cred_entity_derivation = "m/" + localBplus.B_derivation + "/1/" + full_credential_derivation;

        let credential_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet,full_cred_entity_derivation);
        let credential_pubExtKey = AEL.getPublicExtendedKey(credential_wallet);

        localCMeta.extPublicKey = credential_pubExtKey;
        localBplus.credential_derivations[localCMetaIdz] = localCMeta;

        this.Bplus_derivation[localBplusIdx] = localBplus;

        return credential_pubExtKey;

    }

    getCredentialDerivation(entityStr, credentialID)
    {

        let localBplus = this.getBPlusDerivation(entityStr);
        let localCMeta = this.getCMeta(localBplus,credentialID);
        let full_presentation_derivation = localCMeta.usr_derivation_part + "/" + localCMeta.entity_derivation_part;
        return full_presentation_derivation;

    }

    setPresentationDerivation (entityStr,presentationID,entityPresDerivation) {
        //  presentation_derivations: array of objects where we do have each FOR each credential of that entity:
        //      id
        //      usr_derivation_part
        //      entity_derivation_part
        //      extPublicKey
        let localBplus = this.getBPlusDerivation(entityStr);
        let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let presentation_meta_info = {};
        presentation_meta_info.id = presentationID;
        // this are two derivation levels, random (those may be passed as arguments so the device wallet decides instead of the library)
        presentation_meta_info.usr_derivation_part = AEL.getRandomIntDerivation() + "/" + AEL.getRandomIntDerivation();
        presentation_meta_info.usr_derivation_part = "192572143/423682035";        
        presentation_meta_info.entity_derivation_part = entityPresDerivation;   
        localBplus.presentation_derivations.push(presentation_meta_info);
        
        this.Bplus_derivation[localBplusIdx] = localBplus;

    }

    getPresentationExtendedPublicKey(entityStr, presentationID)
    {

        let localBplus = this.getBPlusDerivation(entityStr);
        let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let localPMeta = this.getPMeta(localBplus,presentationID);
        let localPMetaIdz = localBplus.presentation_derivations.findIndex(element => element.id === presentationID); 

        let full_presentation_derivation = localPMeta.usr_derivation_part + "/" + localPMeta.entity_derivation_part;
        let full_cred_entity_derivation = "m/" + localBplus.B_derivation + "/2/" + full_presentation_derivation;

        let presentation_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet,full_cred_entity_derivation);
        let presentation_pubExtKey = AEL.getPublicExtendedKey(presentation_wallet);

        localPMeta.extPublicKey = presentation_pubExtKey;
        localBplus.presentation_derivations[localPMetaIdz] = localPMeta;

        this.Bplus_derivation[localBplusIdx] = localBplus;

        return presentation_pubExtKey;

    }

    getPMeta(localBplus, presentationID){

        return localBplus.presentation_derivations.find(element => element.id === presentationID);
    }

    getPresentationDerivation(entityStr, presentationID)
    {

        let localBplus = this.getBPlusDerivation(entityStr);
        let localPMeta = this.getPMeta(localBplus,presentationID);
        let full_presentation_derivation = "m/" + localPMeta.usr_derivation_part + "/2/" + localPMeta.entity_derivation_part;
        return full_presentation_derivation;

    }



    async signPresentation (entityStr, presentationID, presentationStr) {
        // Maybe create a single method for login and presentation signatures?

        let localBplus = this.getBPlusDerivation(entityStr);
        // let localBplusIdx = this.Bplus_derivation.findIndex(element => element.entity === entityStr); 

        let localCMeta = this.getPMeta(localBplus,presentationID);
        // let localCMetaIdz = localBplus.presentation_derivations.findIndex(element => element.id === presentationID); 

        let full_presentation_derivation = localCMeta.usr_derivation_part + "/" + localCMeta.entity_derivation_part;
        let full_cred_entity_derivation = "m/" + localBplus.B_derivation + "/2/" + full_presentation_derivation;

        let presentation_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet,full_cred_entity_derivation);


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

}


module.exports = {
    AE_userWallet: AE_userWallet
}