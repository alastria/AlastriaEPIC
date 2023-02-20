const AEL = require("../../src/AE_library");

async function main() {

    console.log("AE00_proof_of_technology STARTED");

    console.log("AE00 Create one wallet from mnemonic");
    let mnemonic1 = AEL.getRandomMnemonic();
    let wallet1 = AEL.createHDWalletFromMnemonic(mnemonic1);

    console.log("AE00 Get Wallet public Key");
    let publicExtendedKey = AEL.getPublicExtendedKey(wallet1);
    console.log("AE00 Wallet public Key: \t", publicExtendedKey);

    console.log("AE00 Get Wallet from derivation");
    let derivation1 = "m/1037171/104162416/1539517346/351310525/2109440101/575131286/141701039/131071/407/10011001";

    console.log("AE00 Wallet derivation:\t", derivation1);    
    let derivedWallet1 = AEL.getHDWalletDerivation(wallet1, derivation1);

    let publicExtendedKeyDer = AEL.getPublicExtendedKey(derivedWallet1);
    console.log("AE00 Derived extPubK:\t", publicExtendedKeyDer);

    console.log("AE00 Create ReadOnly Wallet from Extended Public Key");
    let ROWallet = AEL.createRO_HDWalletFromPublicExtendedKey(publicExtendedKey);

    console.log("AE00 Calculate same derivation from ReadOnly Wallet");
    let ROWalletDer =  AEL.getHDWalletDerivation(ROWallet,derivation1);

    let ROpublicExtendedKeyDer = AEL.getPublicExtendedKey(ROWalletDer);
    console.log("AE00 Derived extPubK:\t", ROpublicExtendedKeyDer);

    console.log("AE00 Test if both derived ExtPubK are the same");
    console.log("AE00 \t\t\t",publicExtendedKeyDer,"\n\t\t\t",ROpublicExtendedKeyDer );

    if (publicExtendedKeyDer == ROpublicExtendedKeyDer) {
        console.log("AE00 Both public keys are the SAME");
    } else {
        console.log("AE00 Both public keys are DIFFERENT");
    }

    console.log("AE00_proof_of_technology FINISHED");

};

main();
