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
        this.login_HDWallet = AEL.getHDWalletDerivation(this.base_HDWallet, this.login_derivation);
        this.login_extPublicKey = AEL.getPublicExtendedKey(this.login_HDWallet);
        

        // 1 -> credencial issuance
        this.credencialIssuance_derivation = "m/1";
        this.credencialIssuance_HDWallet = AEL.getHDWalletDerivation(this.base_HDWallet, this.credencialIssuance_derivation);
        this.credencialIssuance_extPublicKey = AEL.getPublicExtendedKey(this.credencialIssuance_HDWallet);
        // 2 -> presentations

        this.presentations_derivation = "m/2";
        this.presentations_HDWallet = AEL.getHDWalletDerivation(this.base_HDWallet, this.presentations_derivation);
        this.presentations_extPublicKey = AEL.getPublicExtendedKey(this.presentations_HDWallet);
    }

    addCPlusDerivation (entityStr, derivationStr) {
        let localCPD = {};
        localCPD.entity = entityStr;
        localCPD.C_derivation = derivationStr;


        // new, to do most things in a single point
        let user_relationship_wallet = AEL.getHDWalletDerivation(this.identity_HDWallet , "m/" + localCPD.C_derivation);
        localCPD.own_HDWallet = user_relationship_wallet;
        let my_user_relationship_public_key = AEL.getPublicExtendedKey(user_relationship_wallet);
        localCPD.own_extendedPublicKey = my_user_relationship_public_key;

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

    async signLoginChallenge (entityStr, signLoginChallenge)
    {
        // TODO: test with example

        AcmeAcademy = this.getBPlusDerivation(entityStr);
        // common knowledge: "entity/0" would be the standar derivation for "login" for the user BUT it was already in this.login_derivation
        // and therefore we should use login_HDWallet
        let entity_relationship_wallet_login = this.login_HDWallet;
    
        
        // Entity signs login challenge with that login_HDWallet
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
        //review derivations of Entities and Users, that are different
  
        let signerRl = this.getCPlusDerivation(signerStr);
        return this.baseVerifyLoginChallenge(challengeStr,signatureStr,signerRl)

    }
}

module.exports = {    
    AE_entityWallet: AE_entityWallet
}