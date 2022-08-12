const { bip39 } = require("bip39");
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

function createHDWalletFromSeed(seed)
{
    return hdkey.fromMasterSeed(seed);
}

function getPrivateExtendedKey(hdwallet) {
    return this.hdwallet.privateExtendedKey();
}

function getPublicExtendedKey(hdwallet) {
    return this.hdwallet.publicExtendedKey();
}

function getHDWalletDerivation(derivation) {
    //Require stating with 'm' as in 'm/2/3'
    return this.hdwallet.derivePath(derivation);
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
    return myWallet.signMessage(message);
}

function getAdressFromSignedMessage( message, signature) {
    return ethers.utils.verifyMessage(message, signature );
}

function verifyMessageSignature(message, signature, address) {
    return (toChecksumAddress(address) == toChecksumAddress(getAdressFromSignedMessage(message, signature)) )    
}

console.log ("INIT TESTING");

console.log ("1st test: create HDWallet");
//const mnemonic = bip39.generateMnemonic();
const mnemonic = "used rebel ahead harvest journey steak hub core opera wrong rate loan"
testing_wallet = createHDWalletFromMnemonic(mnemonic);

console.log ("2nd test: from a HDWallet create initial identity derivation");
// fixed "m/1037171/131071/0407/10011001/" means "Identity/Alastria/quor/redT", stands for Z0 derivation path schemma
// 94367 is a random number < 2^31 means "Subject's wallet identity recovery", stands for A0 derivation path schema
// 3651441 is a random number < 2^31 means "Subject's wallet derivation", stands for A derivation path schema
// full derivation path schema "Z0/A0/A" will be "m/1037171/131071/0407/10011001/94367/3651441"
const initial_identity_derivation_Z0_A0_A = "m/1037171/131071/0407/10011001/94367/3651441";
initial_identity_wallet = getHDWalletDerivation(initial_identity_derivation);

console.log ("3rd test: Login to Acme acamdemy with wallet");







