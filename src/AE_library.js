const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const Wallet = require("ethereumjs-wallet").default;
const { base58_to_binary } = require("base58-js");
const { ethers } = require("ethers");
const { toChecksumAddress } = require("ethereum-checksum-address");
const AEU = require("./utils/AE_utils");

module.exports = {
  hexadice,
  createHDWalletFromMnemonic,
  createHDWalletFromSeed,
  createHDWalletFromPrivateExtendedKey,
  createRO_HDWalletFromPublicExtendedKey,
  getWalletFromHDWallet,
  getPrivateExtendedKey,
  getPublicExtendedKey,
  getAddressFromPublicKey,
  getHDWalletDerivation,
  hexConversionFromBinary,
  getPrivateKeyFromExtended,
  getPublicKeyFromExtended,
  getEthereumWalletFromPrivateKey,
  signMessage,
  getAdressFromSignedMessage,
  verifyMessageSignature,
  verifyMessageByPublicExtendedKey,
  getRandomInt,
  getRandomIntDerivation,
};

function hexadice(value) {
  conversion = value.toString(16).padStart(2, "0");
  return conversion;
}

// Create HDWallet
function createHDWalletFromMnemonic(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  return hdkey.fromMasterSeed(seed);
}

function createHDWalletFromSeed(seed) {
  return hdkey.fromMasterSeed(seed);
}

function createHDWalletFromPrivateExtendedKey(privateExtendedKey) {
  AEU.check_require("xprv", privateExtendedKey);
  return hdkey.fromExtendedKey(privateExtendedKey);
}

function createRO_HDWalletFromPublicExtendedKey(publicExtendedKey) {
  AEU.check_require("xpub", publicExtendedKey);
  return hdkey.fromExtendedKey(publicExtendedKey);
}

function getWalletFromHDWallet(HDWallet) {
  return HDWallet.getWallet();
}

function getPrivateExtendedKey(HDWallet) {
  return HDWallet.privateExtendedKey();
}

function getAddressFromPublicKey(publicKeyStr) {
  return fromPublicKey(publicKeyStr).getAddressString();
}

function getPublicExtendedKey(HDWallet) {
  return HDWallet.publicExtendedKey();
}

function getHDWalletDerivation(HDWallet, derivation) {
  //Require stating with 'm' as in 'm/2/3'
  return HDWallet.derivePath(derivation);
}

function hexConversionFromBinary(binaryAddress, init, length) {
  hexConversionREAD = "";
  i = 0;
  binaryAddress.forEach((element) => {
    hexConversionREAD += hexadice(element, i);
    i++;
  });

  if (init === undefined || length === undefined) {
    return "0x" + hexConversionREAD;
  } else {
    return "0x" + hexConversionREAD.substring(init, init + length);
  }
}

function getPrivateKeyFromExtended(privateExtendedKey) {
  //From: https://learnmeabitcoin.com/technical/extended-keys#:~:text=An%20extended%20key%20is%20a,public%20keys%20in%20your%20wallet.
  const bin = base58_to_binary(privateExtendedKey);
  return hexConversionFromBinary(bin, 92, 64);
}

function getPublicKeyFromExtended(publicExtendedKey) {
  const bin = base58_to_binary(publicExtendedKey);
  return hexConversionFromBinary(bin, 90, 66);
}

function getEthereumWalletFromPrivateKey(privateKey) {
  return new ethers.Wallet(privateKey);
}

async function signMessage(etherumWallet, message) {
  return await etherumWallet.signMessage(message);
}

function getAdressFromSignedMessage(message, signature) {
  return ethers.utils.verifyMessage(message, signature);
}

function verifyMessageSignature(message, signature, address) {
  return (
    toChecksumAddress(address) ===
    toChecksumAddress(getAdressFromSignedMessage(message, signature))
  );
}

function verifyMessageByPublicExtendedKey(
  message,
  signature,
  extendedPublicKey
) {
  // Entity has to validate the signature of the message with the "/0" derivation of the relationship_public_key that Entity already knows
  // First create a wallet for Public Key derivations
  relationship_public_key_wallet =
    createRO_HDWalletFromPublicExtendedKey(extendedPublicKey);

  // get an Ethereum wallet from the HDWallet
  relationship_public_key_wallet_login_validator = getWalletFromHDWallet(
    relationship_public_key_wallet
  );
  // get the Address of that wallet
  relationship_public_key_wallet_login_address =
    relationship_public_key_wallet_login_validator.getAddressString();

  // In the other hand get the Address form the signature
  signed_login_address = getAdressFromSignedMessage(message, signature);

  // Compare both Addresses, use toChecksumAddress just in case any of them is not normalized
  if (
    toChecksumAddress(relationship_public_key_wallet_login_address) ===
    toChecksumAddress(signed_login_address)
  ) {
    console.log("VALID SIGNATURE");
    return true;
  } else {
    console.log("INCORRECT SIGNATURE");
    return false;
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomIntDerivation() {
  return Math.floor(Math.random() * 2147483648);
}
