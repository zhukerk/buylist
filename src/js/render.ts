import { firebase } from '../index';
import { setUser } from './setUser';
import { List, ListItem } from './classes';
import {
  contentElem,
  modalNewList,
  modalNewListForm,
  modalNewListInput,
  createElemWithClass,
  openCloseOptionsEvent,
  IlistItems,
  IlistItem,
  Ilist,
  modalRenameList,
  modalRenameListForm,
  modalRenameListInput,
  modalRenameListCancelBtn,
  addEvents,
} from './utils';

interface Irender {
  lists(listsArr: Ilist[]): void;
  list(listNumber: number): void;
  trash(trashArr: Ilist[]): void;
  settings(userID: string): void;
}

export const render: Irender = {
  lists(listsArr) {
    const userID: string = (setUser.user as any).uid;

    contentElem.innerHTML = '';

    const addListBtn: HTMLElement = createElemWithClass('button', 'add-list-btn');
    addListBtn.innerHTML = '+';
    contentElem.append(addListBtn);
    addListBtn.addEventListener('click', function (event) {
      event.preventDefault();
      modalNewList.classList.add('modal_is-open');
      modalNewListInput.focus();

      modalNewListForm.addEventListener('submit', function CreateNewList(event) {
        event.preventDefault();

        firebase
          .database()
          .ref(`${userID}/lists`)
          .get()
          .then((snapshot) => {
            const dbLists: Ilist[] = snapshot.val() || [];
            const newListName: string = modalNewListInput.value;
            const newList: Ilist = new List(newListName);

            dbLists.unshift(newList);
            console.log(dbLists);

            firebase.database().ref(`${userID}/lists`).set(dbLists);

            modalNewListInput.value = '';
            modalNewListForm.removeEventListener('submit', CreateNewList);
            modalNewList.classList.remove('modal_is-open');
          });
      });
    });

    listsArr.forEach((list: Ilist, listIndex) => {
      const listElem: HTMLElement = createElemWithClass('div', 'list-elem');
      const listItems: IlistItems = list.items || {};
      const toBuyArr: IlistItem[] = listItems.toBuy || [];
      const purchaseArr: IlistItem[] = listItems.purchased || [];
      const toBuyLetngth: number = toBuyArr.length || 0;
      const purchaseLength: number = purchaseArr.length || 0;
      const numberItems: number = purchaseLength + toBuyLetngth;

      const listElemHTML: string = `
        <h2 class="list-elem__name">${list.listName}</h2>
        <span class="list-elem__counter">${purchaseLength} / ${numberItems}</span>
        <div class="list-elem__options">
          <img src="./img/dots.svg" alt="" />
    
          <div class="list-elem__options-list">
            <a href="#" class="list-elem__options-list-elem">Rename</a>
            <a href="#" class="list-elem__options-list-elem">Delete</a>
          </div>
        </div>
        <div class="list-elem__progress">
          <div class="list-elem__progress_blue"></div>
        </div>
      `;

      listElem.innerHTML = listElemHTML;
      const progressBlueLine: HTMLElement = listElem.querySelector('.list-elem__progress_blue');
      progressBlueLine.style.width = ((purchaseLength / numberItems) || 1) * 100 + '%';

      const options: HTMLDivElement = listElem.querySelector('.list-elem__options');
      const optionsList: HTMLDivElement = listElem.querySelector('.list-elem__options-list');
      const renameListBtn: Element = optionsList.firstElementChild;
      const deleteListBtn: Element = optionsList.lastElementChild;

      openCloseOptionsEvent(options, optionsList, 'list-elem__options-list');

      contentElem.insertAdjacentElement('beforeend', listElem);

      renameListBtn.addEventListener('click', function (event) {
        event.preventDefault();

        function renameListFunc(e: Event) {
          e.preventDefault();

          if (list.listName !== modalRenameListInput.value) {
            firebase.database().ref(`${userID}/lists/${listIndex}/listName`).set(modalRenameListInput.value);
          }

          modalRenameList.classList.remove('modal_is-open');
          modalRenameListForm.removeEventListener('submit', renameListFunc);
        }

        optionsList.classList.remove('list-elem__options-list_is-open');
        modalRenameList.classList.add('modal_is-open');
        modalRenameListInput.value = list.listName;

        modalRenameListForm.addEventListener('submit', renameListFunc);

        modalRenameListCancelBtn.addEventListener('click', function () {
          modalRenameList.classList.remove('modal_is-open');
          modalRenameListForm.removeEventListener('submit', renameListFunc);
        });

        modalRenameList.addEventListener('click', function (event) {
          if ((event.target as Element).classList.contains('modal')) {
            modalRenameList.classList.remove('modal_is-open');
            modalRenameListForm.removeEventListener('submit', renameListFunc);
          }
        });
      });

      deleteListBtn.addEventListener('click', function (event) {
        event.preventDefault();
        optionsList.classList.remove('list-elem__options-list_is-open');

        firebase
          .database()
          .ref(`${userID}/lists`)
          .get()
          .then((snapshot) => {
            const dbListsSnapshot: Ilist[] = snapshot.val() || [];
            dbListsSnapshot.splice(listIndex, 1);
            firebase.database().ref(`${userID}/lists`).set(dbListsSnapshot);
          });

        firebase
          .database()
          .ref(`${userID}/trash`)
          .get()
          .then((snapshot) => {
            const dbTrashSnapshot: Ilist[] = snapshot.val() || [];
            dbTrashSnapshot.unshift(list);
            firebase.database().ref(`${userID}/trash`).set(dbTrashSnapshot);
          });
      });

      listElem.addEventListener('click', function renderThisList(event) {
        if (!(event.target as HTMLElement).closest('.list-elem__options')) {
          contentElem.className = 'content list';
          render.list(listIndex);
          listElem.removeEventListener('click', renderThisList);
        }
      });
    });
  },

  list(listNumber) {
    const userID: string = (setUser.user as any).uid;

    firebase.database().ref(`${userID}/lists`).off();

    firebase
      .database()
      .ref(`${userID}/lists/${listNumber}`)
      .on('value', (snapshot) => {
        const dbListSnapshot: Ilist = snapshot.val();
        const dbListName: string = dbListSnapshot.listName;
        const dbListItems: IlistItems = dbListSnapshot.items;
        let dbListToBuy: IlistItem[] = [];
        let dbListPurchased: IlistItem[] = [];
        if (dbListItems) {
          dbListToBuy = dbListItems.toBuy || [];
          dbListPurchased = dbListItems.purchased || [];
        }

        contentElem.innerHTML = `
          <input type="text" class="shoplist__name" value="${dbListName}">
          <form class="shoplist__add-item">
            <label class="shoplist__add-input-label" for="add-item">+</label>
            <input type="text" name="add-item" id="add-item" class="shoplist__add-input" placeholder="Add item" />
          </form>
        `;

        const shoplistNameInput: HTMLInputElement = contentElem.querySelector('.shoplist__name');
        shoplistNameInput.addEventListener('change', function () {
          firebase.database().ref(`${userID}/lists/${listNumber}/listName`).set(shoplistNameInput.value);
        });

        const shoplistAddItem: HTMLFormElement = contentElem.querySelector('.shoplist__add-item');
        const shoplistAddInput: HTMLInputElement = shoplistAddItem.querySelector('.shoplist__add-input');
        shoplistAddItem.addEventListener('submit', function (event) {
          event.preventDefault();

          const newItem: IlistItem = new ListItem(shoplistAddInput.value);
          dbListToBuy.unshift(newItem);
          firebase.database().ref(`${userID}/lists/${listNumber}/items/toBuy`).set(dbListToBuy);
        });

        if (dbListToBuy.length) {
          const shoplistToBuyElem: Element = createElemWithClass('ul', 'shoplist__to-buy');

          dbListToBuy.forEach((listItem: IlistItem, listItemIndex) => {
            const shoplistItemElem: Element = createElemWithClass('li', 'shoplist__item');

            shoplistItemElem.innerHTML = `
              <div class="shoplist__item-name">
                <input class="checkbox" type="checkbox" name="add-item-${listItemIndex}" id="add-item-${listItemIndex}" />
                <label class="checkbox__label" for="add-item-${listItemIndex}"></label>
                <span class="shoplist__item-name-text">${listItem.itemName}</span>
                <button class="drop">
                  <span></span>
                </button>
              </div>
              <div class="shoplist__item-info">
                <button class="shoplist__item-quantity-btn shoplist__item-quantity-btn_minus">-</button>
                <span class="shoplist__item-quantity">${listItem.quantity}</span>
                <button class="shoplist__item-quantity-btn shoplist__item-quantity-btn_plus">+</button>
                <select name="unit-1" id="unit-1" class="shoplist__item-unit">
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="gr">gr</option>
                  <option value="lit">lit</option>
                </select>
                <button class="shoplist__item-delete">
                  <img src="./img/trash.svg" alt="" class="shoplist__item-delete-img" />
                </button>
              </div>
            `;

            const options: Element[] = [...shoplistItemElem.querySelectorAll('option')];
            options.map((elem) => {
              if (elem.innerHTML === (listItem as IlistItem).unit) {
                elem.setAttribute('selected', 'selected');
              }
            });

            const deleteBtn: Element = shoplistItemElem.querySelector('.shoplist__item-delete');
            deleteBtn.addEventListener('click', function (event) {
              event.preventDefault();

              dbListToBuy.splice(listItemIndex, 1);
              firebase.database().ref(`${userID}/lists/${listNumber}/items/toBuy`).set(dbListToBuy);
            });

            shoplistToBuyElem.insertAdjacentElement('beforeend', shoplistItemElem);
          });

          contentElem.insertAdjacentElement('beforeend', shoplistToBuyElem);
        }

        if (dbListPurchased.length) {
          const shoplistPurchasedElem: Element = createElemWithClass('ul', 'shoplist__purchase');

          dbListPurchased.forEach((listItem: IlistItem, listItemIndex) => {
            const shoplistItemElem: Element = createElemWithClass('li', 'shoplist__item shoplist__item_purchase');
            const addItemID: number = dbListToBuy.length + listItemIndex;

            shoplistItemElem.innerHTML = `
              <div class="shoplist__item-name">
                <input class="checkbox" type="checkbox" checked name="add-item-${addItemID}" id="add-item-${addItemID}" />
                <label class="checkbox__label" for="add-item-${addItemID}"></label>
                <span class="shoplist__item-name-text">${listItem.itemName}</span>
              </div>
              <div class="shoplist__item-info">
                <span class="shoplist__item-quantity_purchase">${listItem.quantity}</span>
                <span class="shoplist__item-unit">${listItem.unit}</span>
                <button class="shoplist__item-delete">
                  <img src="./img/trash.svg" alt="" class="shoplist__item-delete-img" />
                </button>
              </div>
            `;

            const deleteBtn: Element = shoplistItemElem.querySelector('.shoplist__item-delete');
            deleteBtn.addEventListener('click', function (event) {
              event.preventDefault();

              dbListPurchased.splice(listItemIndex, 1);
              firebase.database().ref(`${userID}/lists/${listNumber}/items/purchased`).set(dbListPurchased);
            });

            shoplistPurchasedElem.insertAdjacentElement('beforeend', shoplistItemElem);
          });

          contentElem.insertAdjacentElement('beforeend', shoplistPurchasedElem);
        }
      });

    // firebase
    //   .database()
    //   .ref(`${userID}/lists/${listNumber}`)
    //   .get()
    //   .then((snapshot) => {
    //     const list: Ilist = (dbListItems = snapshot.val() || []);
    //     dbListItems = list.items;
    //     dbListName = list.listName;

    //     contentElem.innerHTML = `
    //       <div class="shoplist__name">${dbListName}</div>
    //       <div class="shoplist__add-item">
    //         <label class="shoplist__add-input-label" for="add-item">+</label>
    //         <input type="text" name="add-item" id="add-item" class="shoplist__add-input" placeholder="Add item" />
    //       </div>
    //       `;

    //     const shoplistList: Element = createElemWithClass('ul', 'shoplist__list');

    //     dbListItems.forEach((item: IlistItem) => {
    //       const shoplistItem: Element = createElemWithClass('li', 'shoplist__item');

    //       shoplistItem.innerHTML = `
    //         <div class="shoplist__item-name">
    //           <input class="checkbox" type="checkbox" name="add-item-1" id="add-item-1" />
    //           <label class="checkbox__label" for="add-item-1"></label>
    //           <span class="shoplist__item-name-text">
    //             ${item.itemName}
    //           </span>
    //           <button class="drop">
    //             <span></span>
    //           </button>
    //         </div>
    //         <div class="shoplist__item-info">
    //           <button class="shoplist__item-quantity-btn shoplist__item-quantity-btn_minus">-</button>
    //           <span class="shoplist__item-quantity">
    //             ${item.quantity}
    //           </span>
    //           <button class="shoplist__item-quantity-btn shoplist__item-quantity-btn_plus">+</button>
    //           <select name="unit-1" id="unit-1" class="shoplist__item-unit">
    //             <option value="pcs">pcs</option>
    //             <option value="kg">kg</option>
    //             <option value="lit">lit</option>
    //           </select>
    //           <button class="shoplist__item-delete">
    //             <img src="./img/trash.svg" alt="" class="shoplist__item-delete-img" />
    //           </button>
    //         </div>
    //       `;

    //       const options: Element[] = [...shoplistItem.querySelectorAll('option')];
    //       options.map((elem) => {
    //         if (elem.innerHTML === (item as IlistItem).unit) {
    //           elem.setAttribute('selected', 'selected');
    //         }
    //       });

    //       shoplistList.insertAdjacentElement('beforeend', shoplistItem);
    //     });

    //     contentElem.insertAdjacentElement('beforeend', shoplistList);
    //   });

    // .on('value', (snapshot) => {
    //   const list: object = (dbListItems = snapshot.val());
    //   dbListItems = (list as any).items;
    //   dbListName = (list as any).listName;
    // });
  },

  trash(trashArr) {
    const userID: string = (setUser.user as any).uid;

    contentElem.innerHTML = '';

    trashArr.forEach((list: Ilist, listIndex) => {
      const listElem: HTMLElement = createElemWithClass('div', 'list-elem');
      const listItems: IlistItems = list.items || {};
      const toBuyArr: IlistItem[] = listItems.toBuy || [];
      const purchaseArr: IlistItem[] = listItems.purchased || [];
      const toBuyLetngth: number = toBuyArr.length || 0;
      const purchaseLength: number = purchaseArr.length || 0;
      const numberItems: number = purchaseLength + toBuyLetngth;

      const listElemHTML: string = `
        <h2 class="list-elem__name">
        ${list.listName}
        </h2>
        <span class="list-elem__counter">${purchaseLength} / ${numberItems}</span>
        <div class="trash-btns">
          <button class="trash-btn">restore</button>
          <button class="trash-btn">delete</button>
        </div>
      `;

      listElem.innerHTML = listElemHTML;

      const listBtns: Element = listElem.querySelector('.trash-btns');
      const restoreListBtn: Element = listBtns.firstElementChild;
      const deleteListBtn: Element = listBtns.lastElementChild;

      contentElem.insertAdjacentElement('beforeend', listElem);

      restoreListBtn.addEventListener('click', function (event) {
        event.preventDefault();

        firebase
          .database()
          .ref(`${userID}/trash`)
          .get()
          .then((snapshot) => {
            const dbTrashSnapshot: Ilist[] = snapshot.val() || [];
            dbTrashSnapshot.splice(listIndex, 1);
            firebase.database().ref(`${userID}/trash`).set(dbTrashSnapshot);
          });

        firebase
          .database()
          .ref(`${userID}/lists`)
          .get()
          .then((snapshot) => {
            const dbListsSnapshot: Ilist[] = snapshot.val() || [];
            dbListsSnapshot.unshift(list);
            firebase.database().ref(`${userID}/lists`).set(dbListsSnapshot);
          });
      });

      deleteListBtn.addEventListener('click', function (event) {
        event.preventDefault();

        firebase
          .database()
          .ref(`${userID}/trash`)
          .get()
          .then((snapshot) => {
            const dbTrashSnapshot: Ilist[] = snapshot.val() || [];
            dbTrashSnapshot.splice(listIndex, 1);
            firebase.database().ref(`${userID}/trash`).set(dbTrashSnapshot);
          });
      });
    });
  },

  settings(userID) {},
};
