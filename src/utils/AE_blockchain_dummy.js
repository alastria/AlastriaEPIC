module.exports = { RegisterBLK, RevokeBLK };


function RegisterBLK(items) {
    console.log("RegisterBLK #items:",items.length);
    console.log("RegisterBLK  items:\n",items);
    return true;
}

function RevokeBLK(items) {
    console.log("RevokeBLK #items:",items.length);
    console.log("RevokeBLK  items:\n",items);
    return true;
}