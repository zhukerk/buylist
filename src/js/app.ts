import { setUser } from './setUser';
import { addEvents, toggleAuthDom } from './utils';
import {render} from './render';
import { firebase } from '../index';

export const init = () => {
    firebase.database().ref(`jnnMDhmsAjeXnVpeTlLeSNY8Zdn1/lists`).set([{name: "name1"}, {name: "name2", items: [{name:"itemName", cost:"itemCost"}]} ]);

    setUser.initUser();
    addEvents();
    render.lists('jnnMDhmsAjeXnVpeTlLeSNY8Zdn1');
}
