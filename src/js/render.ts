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
} from './utils';

interface Irender {
  lists(listsArr: Ilist[]): void;
  list(listNumber: number): void;
  trash(trashArr: Ilist[]): void;
  settings(): void;
  helloScreen(): void;
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
      progressBlueLine.style.width = (purchaseLength / numberItems || 1) * 100 + '%';

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

    contentElem.innerHTML = `
    <input type="text" class="shoplist__name">
    <form class="shoplist__add-item">
      <label class="shoplist__add-input-label" for="add-item">+</label>
      <input type="text" name="add-item" id="add-item" class="shoplist__add-input" placeholder="Add item" />
    </form>
    <ul class="shoplist__to-buy"></ul>
    <ul class="shoplist__purchase"></ul>
  `;

    const shoplistAddItem: HTMLFormElement = contentElem.querySelector('.shoplist__add-item');
    const shoplistAddInput: HTMLInputElement = shoplistAddItem.querySelector('.shoplist__add-input');

    shoplistAddItem.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!shoplistAddInput.value.trim()) return;

      firebase
        .database()
        .ref(`${userID}/lists/${listNumber}/items/toBuy`)
        .get()
        .then((snapshot) => {
          const dbListToBuySnapshot: IlistItem[] = snapshot.val() || [];

          const newItem: IlistItem = new ListItem(shoplistAddInput.value);
          dbListToBuySnapshot.unshift(newItem);
          firebase.database().ref(`${userID}/lists/${listNumber}/items/toBuy`).set(dbListToBuySnapshot);

          shoplistAddInput.value = '';
          shoplistAddInput.focus();
        });
    });

    firebase
      .database()
      .ref(`${userID}/lists/${listNumber}`)
      .on('value', (snapshot) => {
        const dbListSnapshot: Ilist = snapshot.val();
        const dbListName: string = dbListSnapshot.listName;
        const dbListItems: IlistItems = dbListSnapshot.items;
        const dbListToBuy: IlistItem[] = dbListItems?.toBuy || [];
        const dbListPurchased: IlistItem[] = dbListItems?.purchased || [];

        const listNameElem: HTMLInputElement = contentElem.querySelector('.shoplist__name');
        listNameElem.value = dbListName;

        const shoplistNameInput: HTMLInputElement = contentElem.querySelector('.shoplist__name');
        shoplistNameInput.addEventListener('change', function () {
          firebase.database().ref(`${userID}/lists/${listNumber}/listName`).set(shoplistNameInput.value);
        });

        const shoplistToBuyElem: HTMLUListElement = contentElem.querySelector('.shoplist__to-buy');
        shoplistToBuyElem.innerHTML = '';
        if (dbListToBuy.length) {
          dbListToBuy.forEach((listItem: IlistItem, listItemIndex) => {
            const shoplistItemElem: Element = createElemWithClass('li', 'shoplist__item');

            // <input type="text" class="shoplist__item-name-text" value="${listItem.itemName}">
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
                <input type="number" max="99999" class="shoplist__item-quantity" value="${listItem.quantity}">
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

            const checkbox: HTMLInputElement = shoplistItemElem.querySelector(`#add-item-${listItemIndex}`);
            checkbox.addEventListener('change', function () {
              dbListToBuy.splice(listItemIndex, 1);
              firebase.database().ref(`${userID}/lists/${listNumber}/items/toBuy`).set(dbListToBuy);

              dbListPurchased.unshift(listItem);
              firebase.database().ref(`${userID}/lists/${listNumber}/items/purchased`).set(dbListPurchased);
            });

            const itemNameText: HTMLSpanElement = shoplistItemElem.querySelector('.shoplist__item-name-text');
            itemNameText.addEventListener('click', function () {
              itemNameText.innerHTML = `<input type="text" class="shoplist__item-name-text-input" value="${listItem.itemName}">`;

              const input: HTMLInputElement = itemNameText.querySelector('.shoplist__item-name-text-input');
              input.focus();

              input.addEventListener('change', function () {
                firebase
                  .database()
                  .ref(`${userID}/lists/${listNumber}/items/toBuy/${listItemIndex}/itemName`)
                  .set(input.value);
              });

              input.addEventListener('blur', function () {
                itemNameText.innerHTML = listItem.itemName;
              });

              input.addEventListener('keydown', function (event) {
                if (event.keyCode === 13) {
                  itemNameText.innerHTML = listItem.itemName;
                }
              });
            });

            const quantityInput: HTMLInputElement = shoplistItemElem.querySelector('.shoplist__item-quantity');
            quantityInput.addEventListener('change', function () {
              let value: number = +quantityInput.value;

              if (value > 0) {
                if (!Number.isInteger(value)) {
                  value = +value.toFixed(1);
                }

                if (value > 9999.9) {
                  value = 9999;
                }
              } else {
                value = 1;
              }

              firebase.database().ref(`${userID}/lists/${listNumber}/items/toBuy/${listItemIndex}/quantity`).set(value);
            });

            const quantityBtnMinus: HTMLButtonElement = shoplistItemElem.querySelector(
              '.shoplist__item-quantity-btn_minus'
            );

            quantityBtnMinus.addEventListener('click', function (event) {
              event.preventDefault();

              if (+quantityInput.value > 1) {
                let newValue: string = (+quantityInput.value - 1).toString();

                if (new Set([...newValue]).has('.')) {
                  newValue = (+newValue).toFixed(1);
                }

                firebase
                  .database()
                  .ref(`${userID}/lists/${listNumber}/items/toBuy/${listItemIndex}/quantity`)
                  .set(newValue);
              }
            });

            const quantityBtnPlus: HTMLButtonElement = shoplistItemElem.querySelector(
              '.shoplist__item-quantity-btn_plus'
            );

            quantityBtnPlus.addEventListener('click', function (event) {
              event.preventDefault();

              let newValue: string = (+quantityInput.value + 1).toString();

              if (new Set([...newValue]).has('.')) {
                newValue = (+newValue).toFixed(1);
              }

              if (+newValue < 9999) {
                firebase
                  .database()
                  .ref(`${userID}/lists/${listNumber}/items/toBuy/${listItemIndex}/quantity`)
                  .set(newValue);
              }
            });

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
        }

        const shoplistPurchasedElem: HTMLUListElement = contentElem.querySelector('.shoplist__purchase');
        shoplistPurchasedElem.innerHTML = '';
        if (dbListPurchased.length) {
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

            const checkbox: HTMLInputElement = shoplistItemElem.querySelector(`#add-item-${addItemID}`);
            checkbox.addEventListener('change', function () {
              dbListPurchased.splice(listItemIndex, 1);
              firebase.database().ref(`${userID}/lists/${listNumber}/items/purchased`).set(dbListPurchased);

              dbListToBuy.push(listItem);
              firebase.database().ref(`${userID}/lists/${listNumber}/items/toBuy`).set(dbListToBuy);
            });

            const deleteBtn: Element = shoplistItemElem.querySelector('.shoplist__item-delete');
            deleteBtn.addEventListener('click', function (event) {
              event.preventDefault();

              dbListPurchased.splice(listItemIndex, 1);
              firebase.database().ref(`${userID}/lists/${listNumber}/items/purchased`).set(dbListPurchased);
            });

            shoplistPurchasedElem.insertAdjacentElement('beforeend', shoplistItemElem);
          });
        }
      });
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

  settings() {
    contentElem.innerHTML = `
      <div class="settings__acc">
        <div class="settings__acc-info">
          <div class="settings__acc-name">${(setUser.user as any).displayName}</div>
          <div class="settings__acc-email">${(setUser.user as any).email}</div>
        </div>
        <div class="settings__acc-text">Change your name:</div>
        <div class="settings__acc-name-change-wrapper">
          <input type="text" name="acc-name" id="acc-name" class="settings__acc-name-change" 
          value="${(setUser.user as any).displayName}"/>
        </div>
      </div>
  `;

    const nameInput: HTMLInputElement = contentElem.querySelector('.settings__acc-name-change');
    const accNameElement: HTMLDivElement = contentElem.querySelector('.settings__acc-name');

    nameInput.addEventListener('change', function (event) {
      event.preventDefault();

      accNameElement.innerHTML = nameInput.value;
      (setUser.user as any).updateProfile({ displayName: nameInput.value });
    });
  },

  helloScreen() {
    contentElem.innerHTML = `
    <section class="hello">
      <p class="hello__text">Здравствуйте, этот проект создан с применением:</p>
      <h3 class="hello__technologies">
        TypeScript, Webpack 4, Gulp, SCSS, Git, БЭМ, Firebase (Authentication, Realtime Database).
      </h3>
      <p class="hello__text">
        Для того, чтобы оценить функционал, пожалуйста, авторизируйтесь или нажмите кнопку ниже. Спасибо за внимание.
      </p>
      <button class="hello__btn">Try with test account</button>
    </section>
  `;

    const button: HTMLButtonElement = contentElem.querySelector('.hello__btn');
    button.addEventListener('click', function () {
      // testtest@test.test
      firebase
        .auth()
        .signInWithEmailAndPassword('testtest@test.test', 'testtest@test.test')
        .catch((err) => {
          const errMessage = err.message;

          alert(errMessage);
          console.log(err);
        });
    });
  },
};
