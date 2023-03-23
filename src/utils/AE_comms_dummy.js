class AE_comms_dummy   {
    constructor() {        
        }

    SendTo( sender, destinatary, varName, varValue) {

        if (this[sender] === undefined) {
                        
            this[sender] = {};
            this[sender][destinatary] = {};
            this[sender][destinatary][varName] = varValue;
        }
        else if (this[sender][destinatary] === undefined ){
            this[sender][destinatary] = {};
            this[sender][destinatary][varName] = varValue;
        }
        else if (this[sender][destinatary][varName] === undefined) {
            this[sender][destinatary][varName] = varValue;
        }                    
        return true;
    }

    Receive( sender, destinatary, varName) {

        return this[sender][destinatary][varName];        

    }

    ReceiveAll (sender, destinatary) {

        return this[sender][destinatary];
    }

}

module.exports = {
    AE_comms_dummy: AE_comms_dummy,
};