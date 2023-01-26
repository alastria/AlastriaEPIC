class AE_Alastree {
  constructor(data) {
    this.parent = null;
    this.descendants = [];
    this.data = data;
  }

  parseJSON(serializedAlastree) {

    // TODO
    // First copy properties
    for (const property in serializedAlastree) {
      if (! (property == "descendants" || serializedAlastree[property] === undefined))
      {
        this[property] = serializedAlastree[property];
      }      
    }
    serializedAlastree.descendants.forEach(element => {
      let lastChild = this.addChild(element.data);
      lastChild.parseJSON (element);
      
    });

    // The copy the descendants

  }

  addChild(data) {
    let child = new AE_Alastree(data);
    child.parent = this;
    this.descendants.push(child);
    return child;
  }

  findChildByData(property, propertyValue) {
    let nodes = [];
    if (this.data[property] == propertyValue) {
      nodes.push(this);
    }
    for (let i = 0; i < this.descendants.length; i++) {
      let rNodes = this.descendants[i].findChildByData(property, propertyValue);
      nodes.push(...rNodes);
    }
    return nodes;
  }

  findAllDescendants() {
    let nodes = [];
    nodes.push(this);
    for (let i = 0; i < this.descendants.length; i++) {
      let rNodes = this.descendants[i].findAllDescendants();
      nodes.push(...rNodes);
    }
    return nodes;
  }

  findAllLeafs() {
    let nodes = [];

    if (this.descendants.length == 0) {
      nodes.push(this);
    } else {
      this.descendants.forEach((element) => {
        let rNodes = element.findAllLeafs();
        nodes.push(...rNodes);
      });
    }

    return nodes;
  }
  

}

module.exports = {
  AE_Alastree: AE_Alastree,
};
