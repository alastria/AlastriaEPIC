const max_derivation = 2147483647; // 2^31 -1

module.exports = { check_require };

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

function check_require(requirement, sampleStr) {

    result = true;

    switch (requirement) {
        case 'xpub':
            matchRE = new RegExp('xpub[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{107}');            
            break;
        case 'xprv':
            matchRE = new RegExp('xprv[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{106}');
            break;
        case 'id_derivation':
            //this returns still a lot of groups
            matchRE = new RegExp('m([\/][0-9]+)+');
            break;
        default:
            break;
    }
    currentMatch = matchRE.exec(sampleStr);    
    if (currentMatch) {
        result = (currentMatch.index === 0);
        
    }

    if (requirement === 'id_derivation') {
        
        derivations = sampleStr.split("/");
        derivations.forEach(element => {
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
