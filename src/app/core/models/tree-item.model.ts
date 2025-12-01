export class TreeItemModel {

  constructor(public id?: any, public name?: string, public children?: TreeItemModel[]) {
    this.id = id;
    this.name = name ;
    this.children = children;
  }
}
