const bip39 = require("bip39");
const { fromExtendedKey } = require("ethereum-cryptography/vendor/hdkey-without-crypto");
const ethJSWallet = require("ethereumjs-wallet");
const { hdkey } = require('ethereumjs-wallet')
const { base58_to_binary } = require('base58-js');
const { builtinModules } = require("module");
const { notDeepEqual } = require("assert");
const { ethers } = require("ethers");
async function test ()
{


const prettyKey = {
    extendedKey: "",
    extendedKeyHex: "",
    versionHex: "",
    depthHex: "",
    parentFingerprintHex: "",
    childNumberHex: "",
    chainCodeHex: "",
    keyHex: "",
    checksumHex: "",
    initialized: false,
    PrettyKey:  function(givenExtendedKey) {
        this.extendedKey = givenExtendedKey;
        initialized = true;
    },
    makePretty: function() {

        if (initialized == true)
        {
            extendedKeyHex = "";
            i = 0;
            bin.forEach(element => {
                extendedKeyHex+= hexadice(element,i);
                i++;
            });

            idx=0;
            len=4*2;
            this.version = extendedKeyHex.substring(idx,idx+len);
            idx+=len;
            len=1*2;        
            this.depthHex = extendedKeyHex.substring(idx,idx+len);
            idx+=len;
            len=4*2;
            this.parentFingerprintHex = extendedKeyHex.substring(idx,idx+len);
            idx+=len;
            len=4*2;        
            this.childNumberHex = extendedKeyHex.substring(idx,idx+len);
            idx+=len;
            len=32*2;
            this.chainCodeHex = extendedKeyHex.substring(idx,idx+len);
            idx+=len;
            len=33*2;
            this.keyHex = extendedKeyHex.substring(idx,idx+len);
            idx+=len;
            len=4*2;
            this.checksumHex = extendedKeyHex.substring(idx,idx+len);

        }
      }
  };




console.log("INICIO");
const mnemonic = bip39.generateMnemonic()
var mnemonic2 = 'used rebel ahead harvest journey steak hub core opera wrong rate loan';
console.log ("mnemonic:");
console.log(mnemonic);

const seed = bip39.mnemonicToSeedSync(mnemonic2)
console.log ("seed");
console.log(seed);
this.hdwallet = hdkey.fromMasterSeed(seed);

console.log ("-------------------------------------------------------------------------------------");

console.log("HDWallet created");
console.log("PrivXKey");
privXkey = this.hdwallet.privateExtendedKey();
console.log(privXkey);
console.log("PubXKey");
pubXkey = this.hdwallet.publicExtendedKey();
console.log(pubXkey);
console.log ("-------------------------------------------------------------------------------------");

console.log("FIRST DERIVATION");
firstDeriv = this.hdwallet.derivePath("m/1");
console.log("PrivXKey");
FDPrivXkey = firstDeriv.privateExtendedKey()
console.log(FDPrivXkey);
console.log("PubXKey");
FDPubXkey = firstDeriv.publicExtendedKey()
console.log(FDPubXkey);
console.log ("-------------------------------------------------------------------------------------");

console.log("SECOND DERIVATION");
firstDeriv = this.hdwallet.derivePath("m/1/1");
console.log("PrivXKey");
FDPrivXkey = firstDeriv.privateExtendedKey()
console.log(FDPrivXkey);
console.log("PubXKey");
FDPubXkey = firstDeriv.publicExtendedKey()
console.log(FDPubXkey);
console.log ("-------------------------------------------------------------------------------------");

console.log("FROM PUBK");
this.from_pubK_hdwallet = hdkey.fromExtendedKey(pubXkey);
//console.log("PrivXKey");
//fromPubK_PrivK = this.from_pubK_hdwallet.privateExtendedKey();
//console.log(fromPubK_PrivK);
console.log("PubXKey");
fromPubK_PubK = this.from_pubK_hdwallet.publicExtendedKey();
console.log(fromPubK_PubK);

console.log("FROM PUBK FIRST DERIVATION");
FP_firstDeriv = this.from_pubK_hdwallet.derivePath("m/1");
//console.log("PrivXKey");
//FP_FDPrivXkey = FP_firstDeriv.privateExtendedKey()
//console.log(FP_FDPrivXkey);
console.log("PubXKey");
FP_FDPubXkey = FP_firstDeriv.publicExtendedKey()
console.log(FP_FDPubXkey);
console.log ("-------------------------------------------------------------------------------------");

console.log("FROM PUBK SECOND DERIVATION");
FP_SD_firstDeriv = this.from_pubK_hdwallet.derivePath("m/1/1");
//console.log("PrivXKey");
//FP_FDPrivXkey = FP_firstDeriv.privateExtendedKey()
//console.log(FP_FDPrivXkey);
console.log("PubXKey");
FP_SD_FDPubXkey = FP_SD_firstDeriv.publicExtendedKey()
console.log(FP_SD_FDPubXkey);
console.log ("-------------------------------------------------------------------------------------");

console.log ("FDPrivXkey");
console.log (FDPrivXkey);
const bin = base58_to_binary(FDPrivXkey);

function hexadice(value,i) {
    conversion = value.toString(16).padStart(2,"0");
    //console.log("val[",i,"]: ",value,"\thex:", conversion)
    return conversion;
}


hexConversion = "";
i = 0;
bin.forEach(element => {
    hexConversion+= hexadice(element,i);
    i++;
});

console.log("wholeHex: ", hexConversion);
console.log("wholeHexLen: ", hexConversion.length);

idx=0;
len=4*2;
console.log("idx,len",idx,len,"\tVersion:",hexConversion.substring(idx,idx+len));
idx+=len;
len=1*2;
console.log("idx,len",idx,len,"\tDepth:",hexConversion.substring(idx,idx+len));
idx+=len;
len=4*2;
console.log("idx,len",idx,len,"\tParent Fingerprint:",hexConversion.substring(idx,idx+len));
idx+=len;
len=4*2;
console.log("idx,len",idx,len,"\tChild Number:",hexConversion.substring(idx,idx+len));
idx+=len;
len=32*2;
console.log("idx,len",idx,len,"\tChain Code:",hexConversion.substring(idx,idx+len));
idx+=len;
len=33*2;
console.log("idx,len",idx,len,"\tKey:",hexConversion.substring(idx,idx+len));
idx+=len;
len=4*2;
console.log("idx,len",idx,len,"\tchecksum:",hexConversion.substring(idx,idx+len));









//crear un signer (wallet hereda de signer)
//https://docs.ethers.io/v5/api/utils/hdnode/#HDNode--properties
walletPrivK ="0x"+hexConversion.substring(92,92+64)
myWallet = new ethers.Wallet(walletPrivK)
//myWallet = new ethers.Wallet.createRandom();
console.log("myWallet.privateKey:", myWallet.privateKey);
console.log("myWallet.publicKey:", myWallet.publicKey);

console.log("antes de firmar");


let firma =  await myWallet.signMessage("Primer mensaje de prueba");

console.log ("firma: ", firma);


const ethAddress =  await myWallet.getAddress()
const hash =  ethers.utils.keccak256(ethAddress)
const pubK = ethers.utils.recoverPublicKey(hash, firma)

hashAddressFirmante = ethers.utils.verifyMessage( "Primer mensaje de prueba" , firma )

console.log("comprobacion");
if ( hashAddressFirmante === ethAddress)
    {
    console.log ("COINCIDEN:", ethAddress);
}
else   
    {
    console.log ("DIFERENTES:", hashAddressFirmante, ethAddress);
}


//Ahora hay que comprobar la firma desde la pubXkey
//Crear HDWallet desde la pubXkey
this.hdKeyREAD = hdkey.fromExtendedKey(pubXkey);


//Derivar
derivacionComprobar = this.hdKeyREAD.derivePath("m/1/1");



walletRead = derivacionComprobar.getWallet();

addressRead = walletRead.getAddress();
console.log("addressRead", addressRead )


hexConversionREAD = "";
i = 0;
addressRead.forEach(element => {
    hexConversionREAD+= hexadice(element,i);
    i++;
});

hexConversionREAD = "0x"+hexConversionREAD;

console.log("addressRead", hexConversionREAD )

//beware of Ethereum addresses checksum
//https://www.npmjs.com/package/ethereum-checksum-address















console.log("FIN");


}

test();