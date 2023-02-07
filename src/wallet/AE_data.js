class AE_data   {
    constructor() {
      this.data = new Map();
      }


    addData(id,data) {
      if (this.data.has(id))
      {
        let errorStr = "id: " + id + " alreadyt exists in this storage object";
        throw new Error(errorStr);
      }
      else
      {
        this.data.set(id,data);
      }      
    }

    getData(id){
      return this.data.get(id);
    }

    deleteData(id) {
      this.data.delete(id);      
    }

    export() {
      return JSON.stringify(this.data);
    }

    import(AEDataStr){      

      this.data = AEDataStr.data;
    }

}

module.exports = {
  AE_data: AE_data,
};