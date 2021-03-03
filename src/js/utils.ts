import { setUser } from './setUser';

export const regExpValidEmail: RegExp = /^\w+@\w+\.\w{2,}$/;

export const burgerMenu: HTMLDivElement = document.querySelector('.burger-menu');
export const headerAuthorization: HTMLButtonElement = document.querySelector('.header__authorization');
export const userBtn: HTMLButtonElement = document.querySelector('.user');
export const sidebar: HTMLElement = document.querySelector('.sidebar');
export const sidebarLinkList: HTMLAnchorElement = document.querySelector('sidebar__link-list');
export const sidebarLinkTrash: HTMLAnchorElement = document.querySelector('sidebar__link-trash');
export const sidebarLinkSettings: HTMLAnchorElement = document.querySelector('sidebar__link-settings');
export const modalNewList: HTMLDivElement = document.querySelector('.modal-new-list');
export const modalRenameList: HTMLDivElement = document.querySelector('.modal-rename-list');
export const authorization: HTMLDivElement = document.querySelector('.authorization');
export const authorizationForm: HTMLDivElement = document.querySelector('.authorization__form');
export const authorizationClose: HTMLButtonElement = document.querySelector('.authorization__close');
export const authorizationForget: HTMLAnchorElement = document.querySelector('.authorization__forget');
export const authorizationInputEmail: HTMLInputElement = document.querySelector('.authorization__input-email');

export function toggleAuthDom(): void {
  if (setUser.user) {
    headerAuthorization.style.display = 'none';
    userBtn.style.display = '';
    userBtn.innerHTML = setUser.user.displayName[0].toUppercase;
  } else {
    headerAuthorization.style.display = '';
    userBtn.style.display = 'none';
  }
}

export const addEvents: Function = (): void => {
  headerAuthorization.addEventListener('click', function (event) {
    authorization.classList.add('authorization__is-open');
  });

  authorization.addEventListener('click', function (event) {
    if (event.target === authorization) {
      authorization.classList.remove('authorization__is-open');
    }
  });

  authorizationClose.addEventListener('click', function (event) {
    event.preventDefault();
    if (event.target === authorizationClose) {
      authorization.classList.remove('authorization__is-open');
    }
  });

  authorizationForget.addEventListener('click', function (event) {
    event.preventDefault();
    setUser.sendForget(authorizationInputEmail.value);
  });
};
