const AEL = require ("./AE_libray");
const { toChecksumAddress } = require('ethereum-checksum-address')
const AEW = require ("./AE_wallet");

async function main() {

    console.log ("INIT TESTING");

    console.log ("1st test: create HDWallets");
    let newUserEpicWallet = new AEW.AE_wallet();
    newUserEpicWallet.setMnemonic("used rebel ahead harvest journey steak hub core opera wrong rate loan");
    newUserEpicWallet.setIdentityDerivation("m/1037171/131071/0407/10011001/94367/3651441");
    newUserEpicWallet.addBPlusDerivation("AcmeAcademy","6385471");

    let newEntityEpicWallet = new AEW.AE_wallet();    
    newEntityEpicWallet.setMnemonic("manage wage hill kitten joke buyer topic focus observe valid december oyster");
    newEntityEpicWallet.setIdentityDerivation("m/1037171/131071/0407/10011001/96278543/2564789");
    newEntityEpicWallet.addBPlusDerivation("User","241573");


    // AcmeAcademy will have a DID as its identity
    // AcmeAcademy will have a DID as VC issuer? 
    // The user will have a DID as VC receiver, we'll calculate it form the derivation: credentialIssuanceDerivation

    // Now the user requests a Credential, credentials are derivation /1 and will have at least 2 user generated derivations (D) and one entity generated derivation (E)
    credentialIssuanceDerivation = "/1"+"/9209455360/2967824134/8707226478";
    credentialText = ' {' +
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
        '      "value": "Example University",' +
        '      "lang": "en"' +
        '    }, {' +
        '      "value": "Exemple d Université",' +
        '      "lang": "fr"' +
        '    }]' +
        '  }' +
        '} ' +   
      '}';

    console.log(credentialText);

    



}

main ();
