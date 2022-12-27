const AEL = require("../src/AE_library");
const { toChecksumAddress } = require("ethereum-checksum-address");
const AEUW = require("../src/wallet/AE_wallet_user");
const AEEW = require("../src/wallet/AE_wallet_entity");
const AEWS = require("./AE_wallet_storage");
const AEU = require("../src/utils/AE_utils");

async function  main() 
{
    console.log("INIT RANDOM TESTS");
    let cp = AEU.cleanPath("//3135////35315/33235/235");
    cp = AEU.cleanDerivaton("//3135////35315/33235/235");

    console.log("Clean Path:", cp);

    let add = AEU.addDerivations("/1","2/3/4");
    let sub = AEU.substractDerivations("/4","1/2/3/4/5/6/4/5/6");


    let part = AEU.subDerivation("1/2/3/4/5/6/4/5/6",3,2);
    console.log("subD",part);



    let newUserEpicWallet = new AEUW.AE_userWallet();
    newUserEpicWallet.setMnemonic("used rebel ahead harvest journey steak hub core opera wrong rate loan" );

    newUserEpicWallet.setIdentityDerivation(
        "m/1037171/94367",
        "/36514417/1996133064/444811548/120132567/3152038/848215",
        "/131071/407/10011001"
        );
    AEWS.storeRecoveryWallet(
    "used rebel ahead harvest journey steak hub core opera wrong rate loan",
    "m/1037171/94367",
    "/36514417/1996133064/444811548/120132567/3152038/848215",
    "/131071/0407/10011001",
    "./User_recovery_wallet.json"
    );   

    AEWS.storeIdentityWallet(newUserEpicWallet, "./User_store_wallet.json");

    let copyUserEpicWallet = new AEUW.AE_userWallet();
    let userIdentityWallet = AEWS.readIdentityWallet("./User_store_wallet.json");
    copyUserEpicWallet.readIdentityWallet(userIdentityWallet);

    let recoveredUserEpicWallet = new AEUW.AE_userWallet();
    let otherWallet = AEWS.readRecoveryWallet("./User_recovery_wallet.json");
    recoveredUserEpicWallet.readRecoveryWallet(otherWallet);
    recoveredUserEpicWallet.readIdentityWallet(userIdentityWallet);


    // More testing

    let entityReWallet = new AEEW.AE_entityWallet();
    entityReWallet.setMnemonic("used rebel ahead harvest journey steak hub core opera wrong rate loan");
    entityReWallet.setIdentityDerivation(
        "m/1037171/94367",
        "/36514417/1996133064/444811548/120132567/3152038/848215",
        "/131071/407/10011001"
        );
    let revocations = entityReWallet.revokeCurrentWallet();
    let storedRecoveryWallet = AEWS.readRecoveryWallet(
        "./Entity_recovery_wallet.json"
      );

    // REMEBER: Update storedRecoveryWallet with new derivation
    entityReWallet.generateNewIdentity(storedRecoveryWallet,"/1698616024/1400660049/59846251/1797304183/58448343/1152581465");

    
}

main();