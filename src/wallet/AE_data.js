class AE_data   {
    constructor() {
      const data = new Map();
      }


    addData(id,data) {
      this.data.set(id,data);
    }

    getData(id){
      return this.data.get(id);
    }

    deleteData(id) {
      this.data.delete(id);      
    }

    export() {
      return JSON.stringify(data);
    }

    import(AEDataStr){
      this.data = JSON.parse(AEDataStr);
    }

}

module.exports = {
  AE_id_data: AE_idData,
};