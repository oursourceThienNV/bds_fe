// import {TreeviewItem} from 'ngx-treeview';
import {TreeItemModel} from "../models/tree-item.model";
// import * as moment from "moment";
//
//
// export function buildUnitTree(data, parentId) {
//   const arr = [];
//   for (let i = 0; i < data.length; i++) {
//     const dataItem = {
//       text: data[i].name,
//       value: data[i].id,
//       parentId: data[i].parentId,
//       children: [],
//       checked: false
//     };
//     if (dataItem.parentId === parentId) {
//       const children = buildUnitTree(data, dataItem.value);
//       if (children.length > 0) {
//         dataItem.children = children;
//       } else {
//         dataItem.children = null;
//       }
//       const dataTreeview = new TreeviewItem({
//         text: dataItem.text,
//         value: dataItem.value,
//         children: dataItem.children,
//         checked: dataItem.checked,
//         collapsed: true
//       });
//       arr.push(dataTreeview);
//     }
//   }
//   return arr.sort((a, b) => a.text.localeCompare(b.text, 'es', {sensitivity: 'base'}));
// }

export function buildUnitTree(data, parentId) {
  const arr = [];
  for (let i = 0; i < data.length; i++) {
    const dataItem = {
      name: data[i].name,
      id: data[i].id,
      parentId: data[i].parentId,
      children: [],
      checked: false
    };
    if (dataItem.parentId === parentId) {
      const children = buildUnitTree(data, dataItem.id);
      if (children.length > 0) {
        dataItem.children = children;
      } else {
        dataItem.children = null;
      }
      const dataTreeview = new TreeItemModel(
        dataItem.id,
        dataItem.name,
        dataItem.children
      );
      arr.push(dataTreeview);
    }
  }
  return arr.sort((a, b) => a.name.localeCompare(b.name, 'es', {sensitivity: 'base'}));
}
