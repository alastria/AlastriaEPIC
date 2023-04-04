const AEL = require("../../src/AE_library");
const { toChecksumAddress } = require("ethereum-checksum-address");
const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEU = require("../../src/utils/AE_utils");
const AED = require("../../src/wallet/AE_data");

async function main() {
  console.log("INIT TESTING");

  console.log("1st test: create HDWallets");
  let newUserEpicWallet = new AEUW.AE_userWallet();
  newUserEpicWallet.setMnemonic(
    "access entry across few mixture island pluck lawn harvest fiction buddy decline"
  );
  // mZR_der, SSSSSW_der, MTN_der
  //newUserEpicWallet.setIdentityDerivation("m/1037171/94367/36514417/1996133064/444811548/120132567/3152038/848215/131071/0407/10011001");
  newUserEpicWallet.setIdentityDerivation(
    "m/1037171/94367",
    "/36514417/1996133064/444811548/120132567/3152038/848215",
    "/131071/407/10011001"
  );
  newUserEpicWallet.addBPlusDerivation("AcmeAcademy", "484199084");

  let newEntityEpicWallet = new AEEW.AE_entityWallet();
  newEntityEpicWallet.setMnemonic(
    "arctic stage defense wink stone crumble buddy vital element shift earn deal"
  );
  // mZR_der, SSSSSW_der, MTN_der
  //newEntityEpicWallet.setIdentityDerivation("m/1037171/86307766/1152697438/415781155/342717333/307131644/1042827527/324692716/131071/0407/10011001");
  newEntityEpicWallet.setIdentityDerivation(
    "m/1037171/86307766",
    "/1152697438/415781155/342717333/307131644/1042827527/324692716",
    "/131071/407/10011001"
  );
  newEntityEpicWallet.addCPlusDerivation("User");

  var credentialText =
    " {" +
    '"@context": [' +
    '  "https://www.w3.org/2018/credentials/v1",' +
    '  "https://www.w3.org/2018/credentials/examples/v1"' +
    "]," +
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
    "    }]" +
    "  }" +
    "} " +
    "}";

  // Replace in the credential the ISSUER with Issuer's ExtendedPublicKey
  let purpose = "credencialIssuance_extPublicKey";
  let puK = newEntityEpicWallet.getPurposePublicKey(purpose);
  credentialText = credentialText.replace("$ISSUER", puK);

  // Replace in the credential the SCHOOL with the School's ExtentendedPublicKey
  // in this case Issuer = School but Issuer's ExtendedPublicKey is the credencialIssuance
  // and the school is the base, this is atipical
  purpose = "identity_ExtPublicKey";
  puK = newEntityEpicWallet.getPurposePublicKey(purpose);
  credentialText = credentialText.replace("$SCHOOL", puK);

  // The credential is issued to a subject, we must use the subject DID or ExtendedPublicKey in the subject
  // To get the ExtendedPublicKey the subject should create a three level derivation: he chooses the first to levels and the entity tells the user the
  // third level, this can change to more levels for security against pre-image attacks
  // Also for identification issues each sigle credential should have a different ID
  let userCredentialChild = newUserEpicWallet.setCredentialDerivation(
    "AcmeAcademy",
    "4b860b60-dd5a-4c3c-ab59-f02252b42772",
    "1251679543"
  );

  let userStorage = new AED.AE_data();
  userStorage.addData("4b860b60-dd5a-4c3c-ab59-f02252b42772",credentialText);

  subjectPublicKey = newUserEpicWallet.getCredentialExtendedPublicKey(
    "AcmeAcademy",
    "4b860b60-dd5a-4c3c-ab59-f02252b42772"
  );


  // FROM login to proper test

  // when connecting with AcmeAcademy the user will tell AcmeAcademy his public key for the communications with AcmeAcademy
  connect_to_acme_academy = newUserEpicWallet.getBPlusDerivation("AcmeAcademy");

  //user_acme_relationship_public_key = connect_to_acme_academy.own_extendedPublicKey;
  user_acme_relationship_public_key =
  connect_to_acme_academy.data.own_extendedPublicKey;

  newEntityEpicWallet.updateCPlusDerivationExtendedKeys(
    "User",
    user_acme_relationship_public_key
  );

  let credUserDer = userCredentialChild.data.objectUserDerivation;
  let credEntityDer = userCredentialChild.data.objectEntityDerivation;


  // Entity calculates credExtPubKey == DID for this credential
  let user = newEntityEpicWallet.getCPlusDerivation("User");
  let tmpUserWallet = AEL.createRO_HDWalletFromPublicExtendedKey(user.data.other_extendedPublicKey);
  let credDer = AEU.cleanDerivation("1/" + credUserDer + "/" + credEntityDer);
  let userCredWallet = AEL.getHDWalletDerivation(tmpUserWallet, credDer);
  let userCredExtPubK = AEL.getPublicExtendedKey(userCredWallet);





  // The issuer saves the user related info for the credential, just in case is needed in the future (like revocations)
  newEntityEpicWallet.setCredentialInfo(
    "User",
    "4b860b60-dd5a-4c3c-ab59-f02252b42772",
    subjectPublicKey,
    credUserDer,
    credEntityDer);


  credentialText = credentialText.replace("$SUBJECT", subjectPublicKey);
  credentialSignature = await newEntityEpicWallet.signCredential(
    credentialText
  );

  // and the user (or anyone) can verify the signature
  // it requires knowing the Public Key, that would be stored in a public shared system, like an smartContact
  let peK = AEL.getPrivateExtendedKey(
    newEntityEpicWallet.getHDWalletByPurpose("credentialIssuance_HDWallet")
  );
   if (AEL.verifyMessageByPublicExtendedKey(
    credentialText,
    credentialSignature,
    peK
  )) {
    console.log("VALID SIGNATURE");
  }
  else {
    console.log("INCORRECT SIGNATURE");
  }
}

main();
