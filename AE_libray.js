const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const { base58_to_binary } = require('base58-js');
const { ethers } = require("ethers");

function hexadice(value) {
    conversion = value.toString(16).padStart(2,"0");    
    return conversion;
}


// Create HDWallet
function createHDWalletFromMnemonic(mnemonic) {

    const seed = bip39.mnemonicToSeedSync(mnemonic)
    return hdkey.fromMasterSeed(seed);

}

function createHDWalletFromSeed(seed){
    return hdkey.fromMasterSeed(seed);
}

function createRO_HDWalletFromPublicExtendedKey(publicExtendedKey) {
    return hdkey.fromExtendedKey(publicExtendedKey);
}

function getWalletFromHDWallet(HDWallet) {
    return HDWallet.getWallet()
}

function getPrivateExtendedKey(HDWallet) {
    return HDWallet.privateExtendedKey();
}

function getPublicExtendedKey(HDWallet) {
    return HDWallet.publicExtendedKey();
}

function getHDWalletDerivation(HDWallet, derivation) {
    //Require stating with 'm' as in 'm/2/3'
    return HDWallet.derivePath(derivation);
}


function getPrivateKeyFromExtended(privateExtendedKey) {
    //From: https://learnmeabitcoin.com/technical/extended-keys#:~:text=An%20extended%20key%20is%20a,public%20keys%20in%20your%20wallet.
    const bin = base58_to_binary(privateExtendedKey);

    hexConversion = "";
    i = 0;
    bin.forEach(element => {
        hexConversion+= hexadice(element,i);
        i++;
    });
    walletPrivK ="0x"+hexConversion.substring(92,92+64)

}

function getPublicKeyFromExtended(publicExtendedKey) {
    const bin = base58_to_binary(privateExtendedKey);

    hexConversion = "";
    i = 0;
    bin.forEach(element => {
        hexConversion+= hexadice(element,i);
        i++;
    });
    walletPrivK ="0x"+hexConversion.substring(90,90+66)
    
}

function getEthereumWalletFromPrivateKey(privateKey) {
    return new ethers.Wallet(privateKey)
}

function signMessage(etherumWallet, message) {
    return etherumWallet.signMessage(message);
}

function getAdressFromSignedMessage(message, signature) {
    return ethers.utils.verifyMessage(message, signature );
}

function verifyMessageSignature(message, signature, address) {
    return (toChecksumAddress(address) == toChecksumAddress(getAdressFromSignedMessage(message, signature)) )    
}


//const mnemonic = bip39.generateMnemonic();
//console.log ("mnemonic: ", mnemonic);

console.log ("INIT TESTING");

console.log ("1st test: create HDWallet");
//const mnemonic = bip39.generateMnemonic();
const mnemonicUser = "used rebel ahead harvest journey steak hub core opera wrong rate loan"
user_wallet = createHDWalletFromMnemonic(mnemonicUser);

console.log ("2nd test: from a HDWallet create initial identity derivation");
// fixed "m/1037171/131071/0407/10011001/" means "Identity/Alastria/quor/redT", stands for Z0 derivation path schemma
// 94367 is a random number < 2^31 means "Subject's wallet identity recovery", stands for A0 derivation path schema
// 3651441 is a random number < 2^31 means "Subject's wallet derivation", stands for A derivation path schema
// full derivation path schema "Z0/A0/A" will be "m/1037171/131071/0407/10011001/94367/3651441"
const user_identity_derivation_Z0_A0_A = "m/1037171/131071/0407/10011001/94367/3651441";
user_identity_wallet = getHDWalletDerivation(user_wallet, user_identity_derivation_Z0_A0_A);

console.log ("3rd test: Login to Acme academy with wallet");
// in order to login with Acme academy the user will create a new derivation por Acme academy, exteding Z0_A0_A with a random derivation for Acme Academy and remembering / storing it
// Acme Academy will be 6385471, random number just for this user
const user_A_AcmeAcademy = "6385471";
const user_identity_derivation_Z0_A0_A_AcmeAcademy = "m/1037171/131071/0407/10011001/94367/3651441/6385471";
// when connecting with Acme Academy the user will tell Acme witch is his private key for the communications with Acme
// there are two modes of creting this wallet: either directly from the testing_wallet or creating a derivation, we will choose the second
// unusef form: user_acme_relationship_wallet = getHDWalletDerivation(testing_wallet, initial_identity_derivation+"m/6385471");
user_acme_relationship_wallet = getHDWalletDerivation(initial_identity_wallet, "m/"+user_A_AcmeAcademy);
user_acme_relationship_public_key = getPublicKeyFromExtended(getPublicExtendedKey(user_acme_relationship_wallet));
// I tell Acme my user_acme_relationship_public_key, that is equivalent to my DID

// Acme Academy also has its own wallet, with an unique derivation to talk with me
const mnemonicAcme = "manage wage hill kitten joke buyer topic focus observe valid december oyster"
acme_wallet =  createHDWalletFromMnemonic(mnemonicAcme);
// fixed "m/1037171/131071/0407/10011001/" means "Identity/Alastria/quor/redT", stands for Z0 derivation path schemma
// 96278543  is a random number < 2^31 means "Subject's wallet identity recovery", stands for A0 derivation path schema
// 2564789 is a random number < 2^31 means "Subject's wallet derivation", stands for A derivation path schema
// full derivation path schema "Z0/A0/A" will be "m/1037171/131071/0407/10011001/96278543/2564789"
acme_initial_identity_derivation = "m/1037171/131071/0407/10011001/96278543/2564789"
acme_identity_wallet = getHDWalletDerivation(acme_wallet, acme_initial_identity_derivation);
// acme also determines a random derivation for its communications with the user
// User will be 241573, random number just for this Acme Academy
const AcmeAcedemy_A_user = "241573";
acme_user_relationship_wallet = getHDWalletDerivation(acme_identity_wallet, "m/"+AcmeAcedemy_A_user);
acme_user_relationship_public_key = getPublicExtendedKey(acme_user_relationship_wallet);

// acme sends me a login challenge
var acme_login_challenge = { 
    "message"  :  "please sign with your Public Key to login", 
    "my_publickKey"   :   "replace"
};
acme_login_challenge = acme_login_challenge.replace("replace",acme_user_relationship_public_key);

// common knowledge: "/0" will be the standar derivation for "login"
user_acme_relationship_wallet_login = getHDWalletDerivation(user_acme_relationship_wallet, "m/0");
user_acme_relationship_public_key_login = getPublicKeyFromExtended(getPublicExtendedKey(user_acme_relationship_wallet_login));

// We do omit Acme Academy public_key validation, that requires KeyRegistry SmartContract or other PKI

// User signs login challenge with user_acme_relationship_public_key_login
// prior to that has to create an Ethereum signer wallet
user_acme_login_signer_eWallet = 
    getEthereumWalletFromPrivateKey(
        getPrivateKeyFromExtended(
            getPrivateExtendedKey(user_acme_relationship_wallet_login)
        )
    );
acme_login_challenge_signed = signMessage(user_acme_login_signer_eWallet, acme_login_challenge);

// Acme has to validate the signature of the message with the "/0" derivation of the user_acme_relationship_public_key that Acme already knows
// First create a wallet for Public Key derivations
user_acme_relationship_public_key_wallet = createRO_HDWalletFromPublicExtendedKey(user_acme_relationship_public_key);
// Then derive with "/0"

user_acme_relationship_public_key_wallet_login = getHDWalletDerivation(user_acme_relationship_public_key_wallet, "m/0");
user_acme_relationship_public_key_wallet_login_validator = getWalletFromHDWallet(user_acme_relationship_public_key_wallet_login);
user_acme_relationship_public_key_wallet_login_address = user_acme_relationship_public_key_wallet_login_validator.getAddress();
signed_login_address = getAdressFromSignedMessage(acme_login_challenge,acme_login_challenge_signed);
if (toChecksumAddress(user_acme_relationship_public_key_wallet_login_address) === toChecksumAddress(signed_login_address)) 
{
    console.log ("VALID SIGNATURE");
}
else   
    {
    console.log ("INCORRECT SIGNATURE");
}
    





