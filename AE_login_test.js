const AEL = require ("./AE_libray");
const { toChecksumAddress } = require('ethereum-checksum-address')
const AEW = require ("./AE_wallet");


async function main() {

    console.log ("INIT TESTING");


    console.log ("1st test: create HDWallets");
    let newUserEpicWallet = new AEW.AE_userWallet();
    let newEntityEpicWallet = new AEW.AE_entityWallet();

    //const mnemonic = bip39.generateMnemonic();
    newUserEpicWallet.setMnemonic("used rebel ahead harvest journey steak hub core opera wrong rate loan");



    console.log ("2nd test: from a HDWallet create initial identity derivation");
    // fixed "m/1037171/131071/0407/10011001/" means "Identity/Alastria/quor/redT", stands for Z0 derivation path schemma
    // 94367 is a random number < 2^31 means "Subject's wallet identity recovery", stands for A0 derivation path schema
    // 3651441 is a random number < 2^31 means "Subject's wallet derivation", stands for A derivation path schema
    // full derivation path schema "Z0/A0/A" will be "m/1037171/131071/0407/10011001/94367/3651441"
    newUserEpicWallet.setIdentityDerivation("m/1037171/131071/0407/10011001/94367/3651441");
    


    console.log ("3rd test: Login to Acme academy with wallet");
    console.log ("\t3rd test, 1st step: Setup communication wallets and keys");


    // in order to login with AcmeAcademy the user will create a new derivation por AcmeAcademy, 
    // exteding Z0_A0_A with a random derivation for AcmeAcademy and remembering / storing it
    // AcmeAcademy will be 6385471, random number just for this user
    // the complete derivation of AcmeAcademy for the user would be: "m/1037171/131071/0407/10011001/94367/3651441/6385471"
    newUserEpicWallet.addBPlusDerivation("AcmeAcademy","6385471");
    
    // when connecting with AcmeAcademy the user will tell AcmeAcademy his public key for the communications with AcmeAcademy
    // there are two modes of creting this wallet: 
    // 1. From the base_wallet with the whole derivation
    // 2. From the identity_wallet using just the B+ derivation for AcmeAcademy, we will choose this one
    AcmeAcademy = newUserEpicWallet.getBPlusDerivation("AcmeAcademy");
    user_acme_relationship_wallet = AEL.getHDWalletDerivation(newUserEpicWallet.identity_HDWallet , "m/" + AcmeAcademy.B_derivation);
    // I tell AcmeAcademy my user_acme_relationship_public_key, that is equivalent to my DID only for AcmeAcademy
    user_acme_relationship_public_key = AEL.getPublicExtendedKey(user_acme_relationship_wallet);
    

    // AcmeAcademy also has its own wallet
    newEntityEpicWallet.setMnemonic("manage wage hill kitten joke buyer topic focus observe valid december oyster");
    

    // fixed "m/1037171/131071/0407/10011001/" means "Identity/Alastria/quor/redT", stands for Z0 derivation path schemma
    // 96278543  is a random number < 2^31 means "Subject's wallet identity recovery", stands for A0 derivation path schema
    // 2564789 is a random number < 2^31 means "Subject's wallet derivation", stands for A derivation path schema
    // full derivation path schema "Z0/A0/A" will be "m/1037171/131071/0407/10011001/96278543/2564789"
    newEntityEpicWallet.setIdentityDerivation("m/1037171/131071/0407/10011001/96278543/2564789");
    
    // AcmeAcademy also determines a random derivation for its communications with the user
    // User will be 241573, random number just for this AcmeAcademy
    newEntityEpicWallet.addCPlusDerivation("User","241573");
    user = newEntityEpicWallet.getCPlusDerivation("User");

    // AcmeAcademy creates a wallet for its relationship with the user <--------------- THINK!!!
    acme_user_relationship_wallet = AEL.getHDWalletDerivation(newEntityEpicWallet.identity_HDWallet, "m/"+user.C_derivation);
    acme_user_relationship_public_key = AEL.getPublicExtendedKey(acme_user_relationship_wallet);


    // Update wallets with exchanged publicKeys    
    newUserEpicWallet.updateBPlusDerivationExtendedKeys("AcmeAcademy",acme_user_relationship_public_key,user_acme_relationship_public_key)
    newEntityEpicWallet.updateCPlusDerivationExtendedKeys("User",user_acme_relationship_public_key,acme_user_relationship_public_key)



    console.log ("\t3rd test, 2nd step: Login challenge");
    // acme sends me a login challenge, adding its Extended Public Key acting as DID
    var acme_login_challenge = "{'message':'please sign with your Public Key to login','my_publicKey':'replace'}";
    acme_login_challenge = acme_login_challenge.replace("replace", AEL.getPublicExtendedKey(newEntityEpicWallet.login_HDWallet));

    // User will create an HDWallet for his communications with ACME Academy
    // common knowledge: "/0" will be the standar derivation for "login" for the user
    user_acme_relationship_wallet_login = AEL.getHDWalletDerivation(user_acme_relationship_wallet, "m/0");
    
    // We do omit Acme Academy public_key validation, that requires KeyRegistry SmartContracts or other PKI

    // User signs login challenge with user_acme_relationship_public_key_login
    // prior to that has to create an Ethereum signer wallet
    user_acme_login_signer_eWallet = 
    AEL.getEthereumWalletFromPrivateKey(
        AEL.getPrivateKeyFromExtended(
            AEL.getPrivateExtendedKey(user_acme_relationship_wallet_login)
            )
        );

    // User signs login challenge
    let acme_login_challenge_signature = await AEL.signMessage(user_acme_login_signer_eWallet, acme_login_challenge);    

    // AcmeAcademy verifies signature with the original challenge and the extendedPublicKey AcmeAcademy calculated from the User PubK + Derivation <------
    AEL.verifyMessageByPublicExtendedKey(acme_login_challenge,acme_login_challenge_signature,
        AEL.getPublicExtendedKey(
            AEL.getHDWalletDerivation(
                AEL.createRO_HDWalletFromPublicExtendedKey(AcmeAcademy.other_extendedPublicKey),
                "m/0"
            )
        )       
    );

    }

main ();