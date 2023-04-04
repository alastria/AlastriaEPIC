const AEUW = require("../../src/wallet/AE_wallet_user");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");
const AED = require("../../src/wallet/AE_data");
const AEB = require("../../src/utils/AE_blockchain_dummy");
const AET = require("../../src/utils/AE_constants");

async function main() {

    // TO-DO - Executing more than once this test return NON VALID LOGIN
    const exampleNumber = "AE0502";
    const exampleText = "Subject Presentation Revocation";
    const logTxt = exampleNumber + " " + exampleText + ":\t";

    console.log(logTxt, "STARTED"); 

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/examples/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    lconsole.log(logTxt,"U - Create object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);



    /////////////////////////////////////////////////////
    // Simulate the selection of a presentation to revoke
    lconsole.log(logTxt,"U - Recover one presentation data to test recovation");
    let leafs = userEpicWallet.DTree.findAllLeafs();
    let presentations = leafs.filter(x => x.data.objectKind == AET.presentation);
    let presentationHash = presentations[0].data.objectID;
    
    /////////////////////////////////////////////////////
    // Set in Blockchain presentation status to revoked
    AEB.RevokeBLK(presentationHash);


    let entityFromPres = "Rent_a_K";

    /////////////////////////////////////////////////////
    // Revoke also the DID used to send that presentation
    lconsole.log(logTxt,"U - Recover the ExtPubK(aka DID) to register status to revoked");
    let pres1_der = userEpicWallet.getPresentationDerivation(entityFromPres,presentationHash);
    let userPubKWallet = AEL.createRO_HDWalletFromPublicExtendedKey(userEpicWallet.identity_ExtPublicKey)
    let presPubKWallet = AEL.getHDWalletDerivation(userPubKWallet, pres1_der);
    let presExtPubK = AEL.getPublicExtendedKey(presPubKWallet);

    lconsole.log(logTxt,"U - Call blockchain to set presentation hash estatus to revoked");
    // RevokeBLK implementation will take care of proper signature of tx
    AEB.RevokeBLK(presExtPubK);

    /////////////////////////////////////////////////////
    // Set Presentation status in user Wallet
    lconsole.log(logTxt,"U - Set object status in wallet");
    userEpicWallet.setObjectStatus(entityFromPres,presentationHash,false);


    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET
    lconsole.log(logTxt,"U - Store identity wallet");
    AEWS.storeIdentityWallet(userEpicWallet, storagePath + "/test_data/AE02_User_Identity_Wallet.json")

    console.log(logTxt, "FINSIHED"); 
}

main();
