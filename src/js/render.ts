import { firebase } from '../index';
import { listsElem, modalNewList, createElemWithClass, openCloseOptionsEvent } from './utils';

interface Irender {
  lists(uid: string): void;
  list(uid: string): void;
  trash(uid: string): void;
}

export const render: Irender = {
  lists(uid: string) {
    let dbLists = [];

    firebase
      .database()
      .ref(`${uid}/lists`)
      .on('value', (snapshot) => {
        dbLists = snapshot.val() || [];
      });

    listsElem.innerHTML = '';

    const addListBtn: HTMLElement = createElemWithClass('button', 'add-list-btn');
    addListBtn.innerHTML = '+';
    listsElem.append(addListBtn);
    addListBtn.addEventListener('click', function (event) {
      event.preventDefault();
      modalNewList.classList.add('modal_is-open');
    });

    dbLists.forEach((list) => {
      const listElem: HTMLElement = createElemWithClass('div', 'list-elem');

      const listElemHTML: string = `
        <h2 class="list-elem__name">${list.name}</h2>
        <span class="list-elem__counter">0 / 0</span>
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

      const options = listElem.querySelector('.list-elem__options');
      const optionsList = listElem.querySelector('.list-elem__options-list');

      openCloseOptionsEvent(options, optionsList, 'list-elem__options-list');
      // options.addEventListener('click', function () {
      //   optionsList.classList.add('list-elem__options-list_is-open');

      //   function fu(elem, elemClass) {
      //     return function fu() {
      //       elem.classList.remove(`${elemClass}_is-open`);
      //       document.removeEventListener('click', fu);
      //     };
      //   }

      //   const fu1 = fu(optionsList, 'list-elem__options-list');

      //   setTimeout(() => {
      //     document.addEventListener('click', fu1);
      //   }, 0);
      // });

      listsElem.insertAdjacentElement('beforeend', listElem);
    });
  },

  list() {},

  trash() {},
};
