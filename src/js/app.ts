import { setUser } from './setUser';
import { addEvents, toggleAuthDom } from './utils';
import { render } from './render';
import { firebase } from '../index';

export const init = () => {
  // let listItems = {
  //   toBuy: [{itemName:"name1", quantity:111, unit: 'pcs'}],
  //   purchased:[{itemName:"name2", quantity:222, unit: 'kg'}]
  // };
  // let listItems1 = {
  //   toBuy: [{itemName:"name1", quantity:111, unit: 'pcs'}, {itemName:"name2", quantity:222, unit: 'kg'}],
  //   purchased:[]
  // };

  // let trash = [{listName: "trash1", items: listItems},{listName: "trash2", items: listItems},{listName: "trash3", items: listItems}]

  // firebase.database().ref(`jnnMDhmsAjeXnVpeTlLeSNY8Zdn1/lists`).set([{listName: "listName11", items: listItems}, {listName: "listName22", items: listItems1} ]);

  // firebase.database().ref(`jnnMDhmsAjeXnVpeTlLeSNY8Zdn1/trash`).set(trash);
  
  setUser.initUser();
  addEvents();

  // render.list('jnnMDhmsAjeXnVpeTlLeSNY8Zdn1', 0);
};
