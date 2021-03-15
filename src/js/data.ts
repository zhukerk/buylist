import {firebase} from '../index';

export const addDataToDb = () => {
  const listItems = {
    toBuy: [{ itemName: 'name1', quantity: 111, unit: 'pcs' }],
    purchased: [{ itemName: 'name2', quantity: 222, unit: 'kg' }],
  };
  
  const listItems1 = {
    toBuy: [
      { itemName: 'name1', quantity: 111, unit: 'pcs' },
      { itemName: 'name2', quantity: 222, unit: 'kg' },
    ],
    purchased: [],
  };
  
  const trash = [
    { listName: 'trash1', items: listItems },
    { listName: 'trash2', items: listItems },
    { listName: 'trash3', items: listItems },
  ];
  
  firebase
    .database()
    .ref(`jnnMDhmsAjeXnVpeTlLeSNY8Zdn1/lists`)
    .set([
      { listName: 'listName11', items: listItems },
      { listName: 'listName22', items: listItems1 },
    ]);
  
  firebase.database().ref(`jnnMDhmsAjeXnVpeTlLeSNY8Zdn1/trash`).set(trash);
}

