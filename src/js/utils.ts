import { firebase } from '..';
import { render } from './render';
import { setUser } from './setUser';

export interface Ilist {
  listName: string;
  items?: { toBuy?: IlistItem[]; purchased?: IlistItem[] };
}

export interface IlistItems {
  toBuy?: IlistItem[];
  purchased?: IlistItem[];
}

export interface IlistItem {
  itemName: string;
  quantity: number;
  unit: string;
}

export const regExpValidEmail: RegExp = /^\w+@\w+\.\w{2,}$/;

export const burgerMenu: HTMLDivElement = document.querySelector('.burger-menu');
export const headerAuthorization: HTMLButtonElement = document.querySelector('.header__authorization');
export const userBtn: HTMLButtonElement = document.querySelector('.user');
export const sidebar: HTMLElement = document.querySelector('.sidebar');
export const modalNewList: HTMLDivElement = document.querySelector('.modal-new-list');
export const modalNewListForm: HTMLButtonElement = modalNewList.querySelector('.modal__form');
export const modalNewListInput: HTMLInputElement = modalNewList.querySelector('.modal__input');
export const modalRenameList: HTMLDivElement = document.querySelector('.modal-rename-list');
export const modalRenameListForm: HTMLFormElement = modalRenameList.querySelector('.modal__form');
export const modalRenameListInput: HTMLInputElement = modalRenameList.querySelector('.modal__input');
export const modalRenameListCancelBtn: Element = modalRenameList.querySelector('.modal__btns').firstElementChild;
// export const modalRenameListCancelBtn: Element = modalRenameListBtns.firstElementChild;
// export const modalRenameListRenameBtn: Element = modalRenameListBtns.lastElementChild;
export const authorization: HTMLDivElement = document.querySelector('.authorization');
export const authorizationForm: HTMLDivElement = authorization.querySelector('.authorization__form');
export const authorizationClose: HTMLButtonElement = authorizationForm.querySelector('.authorization__close');
export const authorizationForget: HTMLAnchorElement = authorizationForm.querySelector('.authorization__forget');
export const authorizationInputEmail: HTMLInputElement = authorizationForm.querySelector('.authorization__input-email');
export const authorizationInputPass: HTMLInputElement = authorizationForm.querySelector('.authorization__input-pass');
export const authorizationBtnSignUp: HTMLAnchorElement = authorizationForm.querySelector('.authorization__btn_sign-up');
export const authorizationBtnSignIn: HTMLAnchorElement = authorizationForm.querySelector('.authorization__btn_sign-in');
export const logOut: HTMLDivElement = document.querySelector('.log-out');
export const logOutEmail: HTMLParagraphElement = document.querySelector('.log-out__email');
export const logOutBtn: HTMLButtonElement = logOut.querySelector('.log-out__btn');
export const logOutCloseBtn: HTMLButtonElement = logOut.querySelector('.log-out__close-btn');
export const contentElem: HTMLDivElement = document.querySelector('.content');

// export const trash: HTMLAnchorElement = document.querySelector('.sidebar__link-trash');
// console.log(trash);

// trash.addEventListener('click', () => {
//   contentElem.className = 'content list';
//   render.list(0)
// });

export function toggleAuthDom(): void {
  console.log(setUser.user);

  if (setUser.user) {
    headerAuthorization.style.display = 'none';
    userBtn.style.display = '';
    authorization.classList.remove('authorization_is-open');
  } else {
    console.log('no setUser');

    headerAuthorization.style.display = '';
    userBtn.style.display = 'none';
  }
}

export function createElemWithClass(elem: string, elemClass: string): HTMLElement {
  const element = document.createElement(elem);
  element.className = elemClass;
  return element;
}

export function openCloseOptionsEvent(openBtn: Element, optionsElem: Element, optionsElemClass: string): void {
  openBtn.addEventListener('click', function openElem() {
    optionsElem.classList.add(`${optionsElemClass}_is-open`);
    openBtn.removeEventListener('click', openElem);

    setTimeout(() => {
      document.addEventListener('click', function closePopUp(event) {
        const target: Element = event.target as Element;

        if (
          target !== optionsElem &&
          !(target.closest(`.${optionsElemClass}`) && !target.classList.contains(`${optionsElemClass}__close-btn`))
        ) {
          optionsElem.classList.remove(`${optionsElemClass}_is-open`);
          document.removeEventListener('click', closePopUp);
          openBtn.addEventListener('click', openElem);
        }
      });
    });
  });
}

function deleteListenersFromLists() {
  const userID: string = (setUser.user as any).uid;
  firebase
    .database()
    .ref(`${userID}/lists`)
    .get()
    .then((snapshot) => {
      const dbListsSnapshot: Ilist[] = snapshot.val();
      dbListsSnapshot.forEach((list: Ilist, listIndex) => {
        firebase.database().ref(`${userID}/lists/${listIndex}`).off();
      });
    });
}

export const addEvents: Function = (): void => {
  headerAuthorization.addEventListener('click', function (event) {
    authorization.classList.add('authorization_is-open');
  });

  authorization.addEventListener('click', function (event) {
    if (event.target === authorization) {
      authorization.classList.remove('authorization_is-open');
    }
  });

  authorizationClose.addEventListener('click', function (event) {
    event.preventDefault();
    if (event.target === authorizationClose) {
      authorization.classList.remove('authorization_is-open');
    }
  });

  authorizationForget.addEventListener('click', function (event) {
    event.preventDefault();
    setUser.sendForget(authorizationInputEmail.value);
  });

  authorizationBtnSignUp.addEventListener('click', function (event) {
    event.preventDefault();
    setUser.signUp(authorizationInputEmail.value, authorizationInputPass.value);
  });

  openCloseOptionsEvent(userBtn, logOut, 'log-out');

  logOutBtn.addEventListener('click', function () {
    logOut.classList.remove('log-out_is-open');
    setUser.logOut();
  });

  logOutCloseBtn.addEventListener('click', function () {
    logOut.classList.remove('log-out_is-open');
  });

  authorizationBtnSignIn.addEventListener('click', function (event) {
    event.preventDefault();
    setUser.signIn(authorizationInputEmail.value, authorizationInputPass.value);
  });

  modalNewList.addEventListener('click', function (event) {
    if ((event.target as Element).classList.contains('modal')) {
      modalNewList.classList.remove('modal_is-open');
      const input: HTMLInputElement = modalNewList.querySelector('.modal__input');
      input.value = '';
    }
  });

  sidebar.addEventListener('click', function (event) {
    const target: Element = event.target as Element;
    const userID: string = (setUser.user as any).uid;

    if (target.closest('.sidebar__btn-lists')) {
      if (contentElem.classList.contains('list')) {
        deleteListenersFromLists();
      }

      contentElem.className = 'content lists';

      firebase.database().ref(`${userID}/trash`).off();

      firebase
        .database()
        .ref(`${userID}/lists`)
        .on('value', (snapshot) => {
          const dbListsSnapshot = snapshot.val() || [];
          render.lists(dbListsSnapshot);
        });
    }

    if (target.closest('.sidebar__btn-trash')) {
      if (contentElem.classList.contains('list')) {
        deleteListenersFromLists();
      }

      contentElem.className = 'content trash';

      firebase.database().ref(`${userID}/lists`).off();

      firebase
        .database()
        .ref(`${userID}/trash`)
        .on('value', (snapshot) => {
          const dbTrashLists = snapshot.val() || [];
          render.trash(dbTrashLists);
        });
    }

    if (target.closest('.sidebar__btn-settings')) render.settings;
  });
};
