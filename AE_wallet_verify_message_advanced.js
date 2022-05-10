const bip39 = require("bip39");
const { fromExtendedKey } = require("ethereum-cryptography/vendor/hdkey-without-crypto");
const ethJSWallet = require("ethereumjs-wallet");
const { hdkey } = require('ethereumjs-wallet')
const { base58_to_binary } = require('base58-js');
const { builtinModules } = require("module");
const { notDeepEqual } = require("assert");
const { ethers } = require("ethers");
const fs = require('fs');
const { toChecksumAddress } = require('ethereum-checksum-address')


function hexadice(value,i) {
    conversion = value.toString(16).padStart(2,"0");
    //console.log("val[",i,"]: ",value,"\thex:", conversion)
    return conversion;
}


padSize = 20;

async function test ()
{



    fileData ="" ;

    console.log("INICIO");
    //const mnemonic = bip39.generateMnemonic();
    
    try {
        fileData = fs.readFileSync('EPIC_messageAndSignature_advanced.txt', 'utf8');
        //{this is the string to sign}
        //0x18f2d95b7b2f354af9b77bc3b116ee42ae4870075d066d8a3e78e6b35e8c31804dfdd5652cf0a77885dcae3148ab6ab3995f8d60d91d64fae00086e5c6031b271c
        //xpub6BdEKfDqUqG9fyLNvKqEbGXN87G56WJaRQYkNKQeyXPuapA24TjVRqA2AohAQ5sxxvamteg3Cpb8jx7WASvcG6VFTMt6ew4roZLLfqTS5sC
        //m/1/1
        console.log(fileData)
    }
    catch (err)
    {
        console.log(err);
    
    }

    fileDataLines = fileData.split("\n");
    i=0;
    fileDataLines.forEach(element => {
        console.log(("linea "+i+":").padEnd(padSize," "),element);
        i++;
        switch (i) {
            case 1:
                originalData = element;
                break;
            case 2:
                firma = element;
                break;
            case 3:
                XpubKey = element;
                break;
            case 4:
                derivacion = "m"+element;
                break;                
            default:
                console.log("Unexpected data:".padEnd(padSize," "),element);
                break;
        }
    });
    


//Ahora hay que comprobar la firma desde la pubXkey
//Crear HDWallet desde la pubXkey
this.hdKeyREAD = hdkey.fromExtendedKey(XpubKey);


//Derivar
derivacionComprobar = this.hdKeyREAD.derivePath(derivacion);

walletRead = derivacionComprobar.getWallet();

addressRead = walletRead.getAddress();
console.log("addressRead".padEnd(padSize," "), addressRead )


hexConversionREAD = "";
i = 0;
addressRead.forEach(element => {
    hexConversionREAD+= hexadice(element,i);
    i++;
});

hexConversionREAD = "0x"+hexConversionREAD;

console.log("addressRead".padEnd(padSize," "), hexConversionREAD )



//beware of Ethereum addresses checksum
//https://www.npmjs.com/package/ethereum-checksum-address


hashAddressFirmante = ethers.utils.verifyMessage(originalData, firma );
console.log("firmante:".padEnd(padSize," "),hashAddressFirmante);

arc = toChecksumAddress(hexConversionREAD)
fc = toChecksumAddress(hashAddressFirmante)

console.log("addressRead Checksum".padEnd(padSize," "), arc)
console.log("firmante  Checksum:".padEnd(padSize," "), fc);

console.log("comprobacion");
if ( arc === fc)
    {
    console.log ("COINCIDEN:".padEnd(padSize," "), arc);
}
else   
    {
    console.log ("DIFERENTES:".padEnd(padSize," "), fc, arc);
}












console.log("FIN");


}

test();