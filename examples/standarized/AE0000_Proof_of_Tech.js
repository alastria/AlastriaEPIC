const AEL = require("../../src/AE_library");

async function main() {

    const exampleNumber = "AE0000";
    const exampleText = "Proof of Tech";
    const logTxt = exampleNumber + " " + exampleText + ":\t";


    console.log(logTxt, "STARTED");

    console.log(logTxt, "Create one wallet from mnemonic");
    let mnemonic1 = AEL.getRandomMnemonic();
    let wallet1 = AEL.createHDWalletFromMnemonic(mnemonic1);

    console.log(logTxt, "Get Wallet public Key");
    let publicExtendedKey = AEL.getPublicExtendedKey(wallet1);
    console.log(logTxt, "Wallet public Key: \t", publicExtendedKey);

    console.log(logTxt, "Get Wallet from derivation");
    let derivation1 = "m/1037171/104162416/1539517346/351310525/2109440101/575131286/141701039/131071/407/10011001";

    console.log(logTxt, "Wallet derivation:\t", derivation1);    
    let derivedWallet1 = AEL.getHDWalletDerivation(wallet1, derivation1);

    let publicExtendedKeyDer = AEL.getPublicExtendedKey(derivedWallet1);
    console.log(logTxt, "Derived extPubK:\t", publicExtendedKeyDer);

    console.log(logTxt, "Create ReadOnly Wallet from Extended Public Key");
    let ROWallet = AEL.createRO_HDWalletFromPublicExtendedKey(publicExtendedKey);

    console.log(logTxt, "Calculate same derivation from ReadOnly Wallet");
    let ROWalletDer =  AEL.getHDWalletDerivation(ROWallet,derivation1);

    let ROpublicExtendedKeyDer = AEL.getPublicExtendedKey(ROWalletDer);
    console.log(logTxt, "Derived extPubK:\t", ROpublicExtendedKeyDer);

    console.log(logTxt, "Test if both derived ExtPubK are the same");
    console.log(logTxt, publicExtendedKeyDer,"\n\t\t\t",ROpublicExtendedKeyDer );

    if (publicExtendedKeyDer == ROpublicExtendedKeyDer) {
        console.log(logTxt, "Both public keys are the SAME");
    } else {
        console.log(logTxt, "Public keys are DIFFERENT");
    }

    console.log(logTxt, "FINISHED");    

};

main();
