const bip39 = require("bip39");
const { fromExtendedKey } = require("ethereum-cryptography/vendor/hdkey-without-crypto");
const ethJSWallet = require("ethereumjs-wallet");
const { hdkey } = require('ethereumjs-wallet')
const { base58_to_binary } = require('base58-js');
const { builtinModules } = require("module");
const { notDeepEqual } = require("assert");
const { ethers } = require("ethers");
const fs = require('fs');

const padSize = 20;



function hexadice(value,i) {
    conversion = value.toString(16).padStart(2,"0");
    //console.log("val[",i,"]: ",value,"\thex:", conversion)
    return conversion;
}


async function test ()
{

    function hexadice(value,i) {
    conversion = value.toString(16).padStart(2,"0");
    //console.log("val[",i,"]: ",value,"\thex:", conversion)
    return conversion;
}


fileData ="" ;

console.log("INICIO");
//const mnemonic = bip39.generateMnemonic();

try {
    fileData = fs.readFileSync('EPIC_test_data_advanced.txt', 'utf8');
    // mnemonic: used rebel ahead harvest journey steak hub core opera wrong rate loan
    // derivationPath: m/1/1
    console.log(fileData)
}
catch (err)
{
    console.log(err);

}

fileDataLines = fileData.split("\n");
i=0;
fileDataLines.forEach(element => {
    //console.log(("linea "+i+":").padEnd(padSize," "),element);
    i++;
    switch (i) {
        case 1:
            mnemonic2 = element;
            break;
        case 2:
            derivacion = element;
            break;
        case 3:
            originalData = element;
            break;
        case 4:
            advancedDerivacion = element;
            break;            
        default:
            console.log("Unexpected data:".padEnd(padSize," "),element);
            break;
    }
});


//var mnemonic2 = 'used rebel ahead harvest journey steak hub core opera wrong rate loan';
//console.log ("mnemonic 2:".padEnd(padSize," "),mnemonic2);


const seed = bip39.mnemonicToSeedSync(mnemonic2)
//console.log ("seed:".padEnd(padSize," "), seed);
this.hdwallet = hdkey.fromMasterSeed(seed);

console.log ("-------------------------------------------------------------------------------------");



  


  

console.log("HDWallet created");

privXkey = this.hdwallet.privateExtendedKey();
console.log("PrivXKey:".padEnd(padSize," "),privXkey);
pubXkey = this.hdwallet.publicExtendedKey();
console.log("PubXKey:".padEnd(padSize," "),pubXkey);
console.log ("-------------------------------------------------------------------------------------");

//console.log("FIRST DERIVATION:".padEnd(padSize," "),"m/1");
//firstDeriv = this.hdwallet.derivePath("m/1");

//FDPrivXkey = firstDeriv.privateExtendedKey()
//console.log("PrivXKey:".padEnd(padSize," "),FDPrivXkey);
//FDPubXkey = firstDeriv.publicExtendedKey()
//console.log("PubXKey:".padEnd(padSize," "),FDPubXkey);

//console.log ("-------------------------------------------------------------------------------------");

console.log("DERIVATION");


step1Der = this.hdwallet.derivePath(derivacion);
SD1PubK = step1Der.publicExtendedKey();
setp2Der = step1Der.derivePath("m"+advancedDerivacion);
FDPrivXkey = setp2Der.privateExtendedKey()


//firstDeriv = this.hdwallet.derivePath(derivacion+advancedDerivacion);
//FDPrivXkey = firstDeriv.privateExtendedKey()
console.log("PrivXKey:".padEnd(padSize," "),FDPrivXkey);

//FDPubXkey = firstDeriv.publicExtendedKey()
FDPubXkey = setp2Der.publicExtendedKey()
console.log("PubXKey:".padEnd(padSize," "),FDPubXkey);

console.log ("-------------------------------------------------------------------------------------");

//console.log("FROM PUBK");
//this.from_pubK_hdwallet = hdkey.fromExtendedKey(pubXkey);
//console.log("PrivXKey");
//fromPubK_PrivK = this.from_pubK_hdwallet.privateExtendedKey();
//console.log(fromPubK_PrivK);

//fromPubK_PubK = this.from_pubK_hdwallet.publicExtendedKey();
//console.log("PubXKey:".padEnd(padSize," "),fromPubK_PubK);


//console.log("FROM PUBK FIRST DERIVATION");
//FP_firstDeriv = this.from_pubK_hdwallet.derivePath("m/1");
////console.log("PrivXKey");
////FP_FDPrivXkey = FP_firstDeriv.privateExtendedKey()
////console.log(FP_FDPrivXkey);
//console.log("PubXKey");
//FP_FDPubXkey = FP_firstDeriv.publicExtendedKey()
//console.log(FP_FDPubXkey);
//console.log ("-------------------------------------------------------------------------------------");

//console.log("FROM PUBK DERIVATION");
//FP_SD_firstDeriv = this.from_pubK_hdwallet.derivePath(derivacion);
//console.log("PrivXKey");
//FP_FDPrivXkey = FP_firstDeriv.privateExtendedKey()
//console.log(FP_FDPrivXkey);

//FP_SD_FDPubXkey = FP_SD_firstDeriv.publicExtendedKey()
//console.log("PubXKey:".padEnd(padSize,""),FP_SD_FDPubXkey);
//console.log ("-------------------------------------------------------------------------------------");

//console.log ("FDPrivXkey:".padEnd(padSize,""),FDPrivXkey);
const bin = base58_to_binary(FDPrivXkey);



hexConversion = "";
i = 0;
bin.forEach(element => {
    hexConversion+= hexadice(element,i);
    i++;
});

//console.log("PARSE XPrivKey");
console.log("FDPrivXkey Hex:".padEnd(padSize,""), hexConversion);
//console.log("FDPrivXkey Hex Len:".padEnd(padSize,""), hexConversion.length);
idx=0;
len=4*2;
//console.log("idx,len:",idx,len,"\tVersion:".padEnd(padSize,""),hexConversion.substring(idx,idx+len));
idx+=len;
len=1*2;
//console.log("idx,len",idx,len,"\tDepth:".padEnd(padSize,""),hexConversion.substring(idx,idx+len));
idx+=len;
len=4*2;
//console.log("idx,len",idx,len,"\tParent Fingerprint:".padEnd(padSize,""),hexConversion.substring(idx,idx+len));
idx+=len;
len=4*2;
//console.log("idx,len",idx,len,"\tChild Number:".padEnd(padSize,""),hexConversion.substring(idx,idx+len));
idx+=len;
len=32*2;
//console.log("idx,len",idx,len,"\tChain Code:".padEnd(padSize,""),hexConversion.substring(idx,idx+len));
idx+=len;
len=33*2;
//console.log("idx,len",idx,len,"\tKey:".padEnd(padSize,""),hexConversion.substring(idx,idx+len));
idx+=len;
len=4*2;
//console.log("idx,len",idx,len,"\tchecksum:".padEnd(padSize,""),hexConversion.substring(idx,idx+len));



//crear un signer (wallet hereda de signer)
//https://docs.ethers.io/v5/api/utils/hdnode/#HDNode--properties
walletPrivK ="0x"+hexConversion.substring(92,92+64)
myWallet = new ethers.Wallet(walletPrivK)
//myWallet = new ethers.Wallet.createRandom();
console.log("myWallet.privateKey:".padEnd(padSize,""), myWallet.privateKey);
console.log("myWallet.publicKey:".padEnd(padSize,""), myWallet.publicKey);

//console.log("antes de firmar");


let firma =  await myWallet.signMessage(originalData);

console.log ("firma: ".padEnd(padSize,""), firma);

m_s = originalData + "\n" + firma + "\n" + SD1PubK + "\n" + advancedDerivacion;

try {
    messageAdndSignature = fs.writeFileSync('EPIC_messageAndSignature_advanced.txt', m_s);
    // mnemonic: used rebel ahead harvest journey steak hub core opera wrong rate loan
    // derivationPath: m/1/1
    
}
catch (err)
{
    console.log(err);

}




//const ethAddress =  await myWallet.getAddress()
//const hash =  ethers.utils.keccak256(ethAddress)
//const pubK = ethers.utils.recoverPublicKey(hash, firma)

//hashAddressFirmante = ethers.utils.verifyMessage(originalData, firma )

//console.log("comprobacion");
//if ( hashAddressFirmante === ethAddress)
//    {
//    console.log ("COINCIDEN:", ethAddress);
//}
//else   
//    {
//    console.log ("DIFERENTES:", hashAddressFirmante, ethAddress);
//}


//Ahora hay que comprobar la firma desde la pubXkey
//Crear HDWallet desde la pubXkey
//this.hdKeyREAD = hdkey.fromExtendedKey(pubXkey);


//Derivar
//derivacionComprobar = this.hdKeyREAD.derivePath("m/1/1");



//walletRead = derivacionComprobar.getWallet();

//addressRead = walletRead.getAddress();
//console.log("addressRead", addressRead )


//hexConversionREAD = "";
//i = 0;
//addressRead.forEach(element => {
//    hexConversionREAD+= hexadice(element,i);
//    i++;
//});

//hexConversionREAD = "0x"+hexConversionREAD;

//console.log("addressRead", hexConversionREAD )

//beware of Ethereum addresses checksum
//https://www.npmjs.com/package/ethereum-checksum-address















console.log("FIN");


}

test();