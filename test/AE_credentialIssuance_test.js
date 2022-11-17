const AEL = require ("../src/AE_library");
const { toChecksumAddress } = require('ethereum-checksum-address')
const AEUW = require ("../src/wallet/AE_wallet_user");
const AEEW = require ("../src/wallet/AE_wallet_entity");

async function main() {

    console.log ("INIT TESTING");

    console.log ("1st test: create HDWallets");
    let newUserEpicWallet = new AEUW.AE_userWallet();
    newUserEpicWallet.setMnemonic("used rebel ahead harvest journey steak hub core opera wrong rate loan");
    // mZR_der, SSSSSW_der, MTN_der
    //newUserEpicWallet.setIdentityDerivation("m/1037171/94367/36514417/1996133064/444811548/120132567/3152038/848215/131071/0407/10011001");
    newUserEpicWallet.setIdentityDerivation("m/1037171/94367","/36514417/1996133064/444811548/120132567/3152038/848215","/131071/0407/10011001");
    newUserEpicWallet.addBPlusDerivation("AcmeAcademy","6385471");

    let newEntityEpicWallet = new AEEW.AE_entityWallet();    
    newEntityEpicWallet.setMnemonic("manage wage hill kitten joke buyer topic focus observe valid december oyster");
    // mZR_der, SSSSSW_der, MTN_der
    //newEntityEpicWallet.setIdentityDerivation("m/1037171/86307766/1152697438/415781155/342717333/307131644/1042827527/324692716/131071/0407/10011001");
    newEntityEpicWallet.setIdentityDerivation("m/1037171/86307766","/1152697438/415781155/342717333/307131644/1042827527/324692716","/131071/0407/10011001");
    newEntityEpicWallet.addCPlusDerivation("User");

  
    
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
    credentialText = credentialText.replace("$ISSUER",newEntityEpicWallet.credencialIssuance_extPublicKey);


    // Replace in the credential the SCHOOL with the School's ExtentendedPublicKey
    // in this case Issuer = School but Issuer's ExtendedPublicKey is the credencialIssuance
    // and the school is the base, this is atipical     
    credentialText = credentialText.replace("$SCHOOL",newEntityEpicWallet.identity_ExtPublicKey);
   
    // The credential is issued to a subject, we must use the subject DID or ExtendedPublicKey in the subject
    // To get the ExtendedPublicKey the subject should create a three level derivation: he chooses the first to levels and the entity tells the user the
    // third level, this can change to more levels for security against pre-image attacks
    // Also for identification issues each sigle credential should have a different ID
    newUserEpicWallet.setCredentialDerivation("AcmeAcademy","4b860b60-dd5a-4c3c-ab59-f02252b42772","1251679543");
    subjectPublicKey = newUserEpicWallet.getCredentialExtendedPublicKey("AcmeAcademy","4b860b60-dd5a-4c3c-ab59-f02252b42772","1251679543");

    // The issuer saves the user related info for the credential, just in case is needed in the future (like revocations)
    newEntityEpicWallet.setCredentialInfo("User", "4b860b60-dd5a-4c3c-ab59-f02252b42772", subjectPublicKey);
   
    credentialText = credentialText.replace("$SUBJECT",subjectPublicKey);
    credentialSignature = await newEntityEpicWallet.signCredential(credentialText);
 

    // and the user (or anyone) can verify the signature    
    // it requires knowing the Public Key, that would be stored in a public shared system, like an smartContact
    AEL.verifyMessageByPublicExtendedKey(credentialText,credentialSignature,newEntityEpicWallet.credencialIssuance_extPublicKey);
 }

main ();
