module.exports = { RegisterBLK, RevokeBLK, DeleteBLK};


function RegisterBLK(items) {
    console.log("RegisterBLK  items:\n",items);
    return true;
}

function RevokeBLK(items) {
    console.log("RevokeBLK  items:\n",items);
    return true;
}

function DeleteBLK(items) {
    console.log("DeleteBLK  items:\n",items);
    return true;
}