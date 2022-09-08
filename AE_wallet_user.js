const AEL = require ("./AE_libray");
//AE_rootWallet
const AEW = require ("./AE_wallet");


class AE_userWallet extends AEW.AE_rootWallet{
    constructor() {
        super();

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

        this.Bplus_derivation.push(localBPD);


    }
    getBPlusDerivation (entityStr) {        
        return this.Bplus_derivation.find(element => element.entity === entityStr);;
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

}


module.exports = {
    AE_userWallet: AE_userWallet
}