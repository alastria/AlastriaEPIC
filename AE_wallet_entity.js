const AEL = require ("./AE_libray");
//AE_rootWallet
const AEW = require ("./AE_wallet");


class AE_entityWallet extends AEW.AE_rootWallet{
    constructor() {
        super();        

        // C_derivation fields:
        // entity: the entity for which this derivation is intented
        // C_derivation: the selected derivation
        // own_HDWallet: pre-generated HDWallet for relationships with that entity
        // own_extendedPublicKey: pre-generated public extended key of this entity with that entity
        this.Cplus_derivation = [];
    }
    
    setMnemonic (mnemonicStr) {
        super.setMnemonic(mnemonicStr);
    }

    setIdentityDerivation (identityDerivationStr) { 
        super.setIdentityDerivation(identityDerivationStr);
        // This corresponds to C derivations aka Purpose 
        // 0 -> login, may be usefull for C2C interactions or to sign login challenges
        this.login_derivation = "m/0";        
        this.login_HDWallet = AEL.getHDWalletDerivation(this.identity_HDWallet, this.login_derivation);
        this.login_extPublicKey = AEL.getPublicExtendedKey(this.login_HDWallet);
        

        // 1 -> credencial issuance
        this.credencialIssuance_derivation = "m/1";
        this.credencialIssuance_HDWallet = AEL.getHDWalletDerivation(this.identity_HDWallet, this.credencialIssuance_derivation);
        this.credencialIssuance_extPublicKey = AEL.getPublicExtendedKey(this.credencialIssuance_HDWallet);
        // 2 -> presentations

        this.presentations_derivation = "m/2";
        this.presentations_HDWallet = AEL.getHDWalletDerivation(this.identity_HDWallet, this.presentations_derivation);
        this.presentations_extPublicKey = AEL.getPublicExtendedKey(this.presentations_HDWallet);
    }

    addCPlusDerivation (entityStr) {
        let localCPD = {};
        localCPD.entity = entityStr;

        // new, to do most things in a single point
        // removing B derivations for entities
        let user_relationship_wallet = this.identity_HDWallet;
        localCPD.own_HDWallet = user_relationship_wallet;
        let my_user_relationship_public_key = AEL.getPublicExtendedKey(user_relationship_wallet);
        localCPD.own_extendedPublicKey = my_user_relationship_public_key;

        localCPD.credentials = [];

        this.Cplus_derivation.push(localCPD);
    }
    getCPlusDerivation (entityStr) {        
        return this.Cplus_derivation.find(element => element.entity === entityStr);;
    }

    updateCPlusDerivationExtendedKeys (userStr, other_extendedKey) {
        let localCplus = this.getCPlusDerivation(userStr);
        let localCplusIdx = this.Cplus_derivation.findIndex(element => element.entity === userStr);

        localCplus.other_extendedPublicKey = other_extendedKey;
        this.Cplus_derivation[localCplusIdx] = localCplus;
    }

    setCredentialInfo(userStr, credentialID, userExtPubK )
    {

        let localCplus = this.getCPlusDerivation(userStr);
        let localCplusIdx = this.Cplus_derivation.findIndex(element => element.entity === userStr);

        let credential_meta_info = {};
        credential_meta_info.credentialID = credentialID;
        credential_meta_info.userExtPubK = userExtPubK;

        localCplus.credentials.push(credential_meta_info);
        
        this.Cplus_derivation[localCplusIdx] = localCplus;
    }

    async signLoginChallenge (entityStr, signLoginChallenge)
    {
        // TODO: this should be similar to user signature?
        // DISCUSS

        
        return ;
    }

    verifyLoginChallenge (signerStr, challengeStr, signatureStr){
        //review derivations of Entities and Users, that are different
  
        let signerRl = this.getCPlusDerivation(signerStr);
        return this.baseVerifyLoginChallenge(challengeStr,signatureStr,signerRl)

    }

    async signCredential (credentialStr) {
        // When a company signs a credential it is independent of the subject that credential is created for
        // this makes easier to verify the credential signtature by the receiver of that credential
        // DISCUSS

        let signature =  AEL.signMessage(
                            AEL.getEthereumWalletFromPrivateKey(
                                AEL.getPrivateKeyFromExtended(
                                    AEL.getPrivateExtendedKey(this.credencialIssuance_HDWallet)
                                )
                            ),
                            credentialStr);
        return signature;

    }

    verifyPresentationSignature(userStr,presentation_derivationStr, credential_setStr, credential_setSignatureStr) {
        let localCplus = this.getCPlusDerivation(userStr);
        let user_Cplus_Wallet = AEL.createRO_HDWalletFromPublicExtendedKey(localCplus.other_extendedPublicKey);
        let user_presentation_wallet = AEL.getHDWalletDerivation(user_Cplus_Wallet,presentation_derivationStr);
        return AEL.verifyMessageByPublicExtendedKey(credential_setStr,credential_setSignatureStr,AEL.getPublicExtendedKey(user_presentation_wallet));

    }

 

    verifyChainOfTrust(user_base_identity_pubK,cred_der_set,credential_pubK_set) {

        let result = true;

        let user_Cplus_Wallet = AEL.createRO_HDWalletFromPublicExtendedKey(user_base_identity_pubK);
        let cred_derived_pubK_array = [];
        i = 0;
        cred_der_set.forEach(element => {
            
            let cred_derived_pubK = AEL.getPublicExtendedKey(AEL.getHDWalletDerivation(user_Cplus_Wallet,cred_der_set[i]));
            cred_derived_pubK_array.push(cred_derived_pubK);
            i++;            
        });

        i = 0;
        cred_derived_pubK_array.every(element => {
            if (!(element === credential_pubK_set[i])){
                console.log ("ERROR validating Chain Of Trust for credentials")
                result = false; 
            }            
            i++;
        });

        if (result) {
            console.log ("Validation Chain Of Trust for credentials CORRECT")
        };

        return result;

    }
}

module.exports = {    
    AE_entityWallet: AE_entityWallet
}