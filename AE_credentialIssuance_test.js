const AEL = require ("./AE_libray");
const { toChecksumAddress } = require('ethereum-checksum-address')
const AEW = require ("./AE_wallet");

async function main() {

    console.log ("INIT TESTING");

    console.log ("1st test: create HDWallets");
    let newUserEpicWallet = new AEW.AE_userWallet();
    newUserEpicWallet.setMnemonic("used rebel ahead harvest journey steak hub core opera wrong rate loan");
    newUserEpicWallet.setIdentityDerivation("m/1037171/131071/0407/10011001/94367/3651441");
    newUserEpicWallet.addBPlusDerivation("AcmeAcademy","6385471");

    let newEntityEpicWallet = new AEW.AE_entityWallet();    
    newEntityEpicWallet.setMnemonic("manage wage hill kitten joke buyer topic focus observe valid december oyster");
    newEntityEpicWallet.setIdentityDerivation("m/1037171/131071/0407/10011001/96278543/2564789");
    newEntityEpicWallet.addCPlusDerivation("User","241573");


    // AcmeAcademy will have a DID as its identity
    // AcmeAcademy will have a DID as VC issuer? Yes a derivation /1 from its Identity derivation

    // The user will have a DID as VC receiver, we'll calculate it form the derivation: credentialIssuanceDerivation
    // Now the user requests a Credential
    credentialIssuanceDerivation = "/1"+"/9209455360/2967824134/8707226478";
    var  credentialText = ' {' +
        '"@context": [' +
        '  "https://www.w3.org/2018/credentials/v1",' +
        '  "https://www.w3.org/2018/credentials/examples/v1"' +
        '],' +
        'id": "http://example.edu/credentials/58473",' +
        '"type": ["VerifiableCredential", "AlumniCredential"],' +
        '"issuer": "$ISSUER",' +
        '"issuanceDate": "2010-01-01T00:00:00Z",' +
        '"credentialSubject": {' +
        '  "id": "$SUBJECT",' +
        '  "alumniOf": {' +
        '    "id": "$SCHOOL",' +
        '    "name": [{' +
        '      "value": "AcmeAcademy",' +
        '      "lang": "en"' +
        '    }]' +
        '  }' +
        '} ' +   
      '}';
    
    // Replace in the credential the ISSUER with Issuer's ExtendedPublicKey
    issuerPublicKey = AEL.getPublicExtendedKey(newEntityEpicWallet.credencialIssuance_HDWallet);
    credentialText = credentialText.replace("$ISSUER",issuerPublicKey);

    // Replace in the credential the SCHOOL with the School's ExtentendedPublicKey
    // in this case Issuer = School but Issuer's ExtendedPublicKey is the credencialIssuance
    // and the school if the base
    schoolPublicKey = AEL.getPublicExtendedKey(newEntityEpicWallet.base_HDWallet);
    credentialText = credentialText.replace("$SCHOOL",schoolPublicKey);

    // Also the credential is issued to a subject, the standard is the "m/1" derivation from the subject identity used for the realtionship with the school
    // in this case it would be 241573/1 (as opposed to 241573/0 used for the login)
    AcmeAcademy = newUserEpicWallet.getBPlusDerivation("AcmeAcademy");
    user_acme_relationship_wallet = AEL.getHDWalletDerivation(newUserEpicWallet.identity_HDWallet , "m/" + AcmeAcademy.B_derivation);

    // I tell AcmeAcademy my user_acme_relationship_public_key, that is equivalent to my DID only for AcmeAcademy
    user_acme_relationship_public_key = AEL.getPublicExtendedKey(user_acme_relationship_wallet);

    // Then AcmeAcademy can calculate my ExtendedPublicKey for VC issuance, that would be derivation "m/1"
    // But that will not be the wallet where the user will receive the VC, we need an extra derivation: 
    // At least 2 user generated derivations (D) and one entity generated derivation (E)
    // /2128469835/1325276260 are generated by the user, /0189032074 is generated by AcmeAcademy
    // so the final DID for the VC for the user will be /1/2128469835/1325276260/0189032074 in addition to his AcmeAcademy already generated Wallet
    user_acme_VC_wallet = AEL.createRO_HDWalletFromPublicExtendedKey(user_acme_relationship_public_key);
    user_acme_VC_wallet = AEL.getHDWalletDerivation(user_acme_VC_wallet, "m/1/2128469835/1325276260/0189032074");
    subjectPublicKey = AEL.getPublicExtendedKey(user_acme_VC_wallet);
    credentialText = credentialText.replace("$SUBJECT",subjectPublicKey);

    // AcmeAcademy will also sign the VC, it will use "/1" derivation of his identity to such purposes, this derivation will be independent of the user so it is easy to validate
    acme_vc_signer_eWallet = 
    AEL.getEthereumWalletFromPrivateKey(
        AEL.getPrivateKeyFromExtended(
            AEL.getPrivateExtendedKey(newEntityEpicWallet.credencialIssuance_HDWallet)
            )
        );

    let acme_user_VC_signature = await AEL.signMessage(acme_vc_signer_eWallet, credentialText);   

    // and the user (or anyone) can verify the signature
    // we do teh calculation from the getPublicExtendedKey(base_HDWallet) that will be the registered publicKey in the SmartContract
    AEL.verifyMessageByPublicExtendedKey(credentialText,acme_user_VC_signature, 
        AEL.getPublicExtendedKey(
            AEL.getHDWalletDerivation(
                AEL.createRO_HDWalletFromPublicExtendedKey(
                    AEL.getPublicExtendedKey(
                        newEntityEpicWallet.base_HDWallet
                    )
                ),
                "m/1"
            )
        )
    );

    console.log(credentialText);

    



}

main ();
