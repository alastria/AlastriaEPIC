const AE = require ("./AE_libray");
const { toChecksumAddress } = require('ethereum-checksum-address')

const userEpicWallet = {
    mnemonic: "",
    base_HDWallet: "",
    // derivation Z0_A0_A
    identity_derivation: "",
    identity_HDWallet: "",
    Bplus_derivation: []
};


const entityEpicWallet = {
    mnemonic: "",
    base_HDWallet: "",
    // derivation Z0_A0_A
    identity_derivation: "",
    identity_HDWallet: "",
    Bplus_derivation: []
};

async function main() {

    console.log ("INIT TESTING");



    console.log ("1st test: create HDWallet");
    //const mnemonic = bip39.generateMnemonic();
    userEpicWallet.mnemonic = "used rebel ahead harvest journey steak hub core opera wrong rate loan"; 
    userEpicWallet.base_HDWallet = AE.createHDWalletFromMnemonic(userEpicWallet.mnemonic);



    console.log ("2nd test: from a HDWallet create initial identity derivation");
    // fixed "m/1037171/131071/0407/10011001/" means "Identity/Alastria/quor/redT", stands for Z0 derivation path schemma
    // 94367 is a random number < 2^31 means "Subject's wallet identity recovery", stands for A0 derivation path schema
    // 3651441 is a random number < 2^31 means "Subject's wallet derivation", stands for A derivation path schema
    // full derivation path schema "Z0/A0/A" will be "m/1037171/131071/0407/10011001/94367/3651441"

    userEpicWallet.identity_derivation = "m/1037171/131071/0407/10011001/94367/3651441";
    userEpicWallet.identity_HDWallet = AE.getHDWalletDerivation(userEpicWallet.base_HDWallet, userEpicWallet.identity_derivation);



    console.log ("3rd test: Login to Acme academy with wallet");
    console.log ("\t3rd test, 1st step: Setup communication wallets and keys");


    // in order to login with AcmeAcademy the user will create a new derivation por AcmeAcademy, exteding Z0_A0_A with a random derivation for AcmeAcademy and remembering / storing it
    // AcmeAcademy will be 6385471, random number just for this user
    // the complete derivation for AcmeAcademy for the user would be: "m/1037171/131071/0407/10011001/94367/3651441/6385471"
    userEpicWallet.Bplus_derivation.push({ entity: 'AcmeAcademy', B_derivation: '6385471' });

    // when connecting with AcmeAcademy the user will tell AcmeAcademy his private key for the communications with AcmeAcademy
    // there are two modes of creting this wallet: either directly from the testing_wallet or creating a derivation, we will choose the second    
    AcmeAcademy = userEpicWallet.Bplus_derivation.find(element => element.entity === "AcmeAcademy");
    user_acme_relationship_wallet = AE.getHDWalletDerivation(userEpicWallet.identity_HDWallet , "m/" + AcmeAcademy.B_derivation);
    // I tell AcmeAcademy my user_acme_relationship_public_key, that is equivalent to my DID only for AcmeAcademy
    user_acme_relationship_public_key = AE.getPublicExtendedKey(user_acme_relationship_wallet);
    

    // AcmeAcademy also has its own wallet
    entityEpicWallet.mnemonic = "manage wage hill kitten joke buyer topic focus observe valid december oyster";
    entityEpicWallet.base_HDWallet =  AE.createHDWalletFromMnemonic(entityEpicWallet.mnemonic);


    // fixed "m/1037171/131071/0407/10011001/" means "Identity/Alastria/quor/redT", stands for Z0 derivation path schemma
    // 96278543  is a random number < 2^31 means "Subject's wallet identity recovery", stands for A0 derivation path schema
    // 2564789 is a random number < 2^31 means "Subject's wallet derivation", stands for A derivation path schema
    // full derivation path schema "Z0/A0/A" will be "m/1037171/131071/0407/10011001/96278543/2564789"
    entityEpicWallet.identity_derivation = "m/1037171/131071/0407/10011001/96278543/2564789"
    entityEpicWallet.identity_HDWallet = AE.getHDWalletDerivation(entityEpicWallet.base_HDWallet, entityEpicWallet.identity_derivation);


    // AcmeAcademy also determines a random derivation for its communications with the user
    // User will be 241573, random number just for this AcmeAcademy
    entityEpicWallet.Bplus_derivation.push({ entity: 'User', B_derivation: '241573' });
    user = entityEpicWallet.Bplus_derivation.find(element => element.entity === "User");

    // AcmeAcademy creates a wallet for its relationship with the user
    acme_user_relationship_wallet = AE.getHDWalletDerivation(entityEpicWallet.identity_HDWallet, "m/"+user.B_derivation);
    // AcmeAcademy tells the user its acme_user_relationship_public_key, that is equivalent to AcmeAcademy DID only for this user
    acme_user_relationship_public_key = AE.getPublicExtendedKey(acme_user_relationship_wallet);


    // Update EpicWallet with exchanged publicKeys
    AcmeAcademyIdx = userEpicWallet.Bplus_derivation.findIndex(element => element.entity === "AcmeAcademy");
    AcmeAcademy.own_extendedPublicKey = acme_user_relationship_public_key;
    AcmeAcademy.other_extendedPublicKey = user_acme_relationship_public_key;
    userEpicWallet.Bplus_derivation[AcmeAcademyIdx] = AcmeAcademy;

    userIdx = entityEpicWallet.Bplus_derivation.findIndex(element => element.entity === "User");
    userIdx.own_extendedPublicKey = user_acme_relationship_public_key;
    userIdx.other_extendedPublicKey = acme_user_relationship_public_key;
    entityEpicWallet[userIdx] = userIdx;



    console.log ("\t3rd test, 2nd step: Login challenge");
    // acme sends me a login challenge
    var acme_login_challenge = "{'message':'please sign with your Public Key to login','my_publicKey':'replace'}";
    acme_login_challenge = acme_login_challenge.replace("replace",AcmeAcademy.own_extendedPublicKey);

    // User will create an HDWallet for his communications with ACME Academy
    // common knowledge: "/0" will be the standar derivation for "login"
    user_acme_relationship_wallet_login = AE.getHDWalletDerivation(user_acme_relationship_wallet, "m/0");
    
    // We do omit Acme Academy public_key validation, that requires KeyRegistry SmartContracts or other PKI

    // User signs login challenge with user_acme_relationship_public_key_login
    // prior to that has to create an Ethereum signer wallet
    user_acme_login_signer_eWallet = 
    AE.getEthereumWalletFromPrivateKey(
        AE.getPrivateKeyFromExtended(
            AE.getPrivateExtendedKey(user_acme_relationship_wallet_login)
            )
        );

    
    let acme_login_challenge_signed = await AE.signMessage(user_acme_login_signer_eWallet, acme_login_challenge);    
    AE.verifyLoginMessage(acme_login_challenge,acme_login_challenge_signed,AcmeAcademy.other_extendedPublicKey);

    }

main ();




