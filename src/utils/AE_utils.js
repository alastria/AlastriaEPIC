const max_derivation = 2147483647; // 2^31 -1

module.exports = { check_require, unParent, reParent, cleanPath, cleanDerivaton, addDerivations, substractDerivations, subDerivation };

function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

function unParent(walletTree) {
  walletTree.parent = null;
  walletTree.descendants.forEach((element) => {
    unParent(element);
  });
}

function reParent(walletTree, parent = null) {
  walletTree.parent = parent;
  walletTree.descendants.forEach((element) => {
    reParent(element, walletTree);
  });
}

function check_require(requirement, sampleStr) {
  result = true;

  switch (requirement) {
    case "xpub":
      matchRE = new RegExp(
        "xpub[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{107}"
      );
      break;
    case "xprv":
      matchRE = new RegExp(
        "xprv[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{106}"
      );
      break;
    case "id_derivation":
      //this returns still a lot of groups
      matchRE = new RegExp("m([/][0-9]+)+");
      break;
    default:
      break;
  }
  currentMatch = matchRE.exec(sampleStr);
  if (currentMatch) {
    result = currentMatch.index === 0;
  }

  if (requirement === "id_derivation") {
    derivations = sampleStr.split("/");
    derivations.forEach((element) => {
      if (!(element === "m")) {
        if (isNumeric(element)) {
          if (element > max_derivation) {
            result = false;
          }
        }
      }
    });
  }

  return result;
}

function cleanPath(path) {

  // this cleans empty derivations
  let steps = path.split("/");
  let builtSteps = "";
  let solidSteps = steps.filter( x => (x.length >0 && (Number.isInteger(x) || Number.isInteger(Number.parseInt(x)))));
  solidSteps.forEach(element => {    
    builtSteps += "/" + element;
  });
  
  return builtSteps;
}

function cleanDerivaton(derivation) {
  
  let cleanD = this.cleanPath(derivation);
  cleanD = "m" + cleanD;

  return cleanD;
}

function addDerivations(der1, der2) {
  
  return this.cleanDerivaton(der1 + der2);
}

function substractDerivations(der1, der2) {
  // result = der2 - der1
  
  derivacion = der2.replace(der1,"");
  derivacion = this.cleanDerivaton(derivacion);
  return derivacion;
}

function subDerivation(derivation, start, length) {
  let path = derivation.replace("m","");
  let chunks = path.split("/");
  let cChunks = chunks.filter( x => (x.length >0) && (!(x === undefined)));
  let subD = "";
  let idx = 0;
  let len = 0;
  cChunks.forEach(
    element => {
      if (idx >= start && len < length) 
      {
        subD = subD + "/" + element;
        len++;
      }
      idx++;
    });
      
  return subD;
  }



