import { firebase } from '..';
import { setUser } from './setUser';

export const regExpValidEmail: RegExp = /^\w+@\w+\.\w{2,}$/;

export const burgerMenu: HTMLDivElement = document.querySelector('.burger-menu');
export const headerAuthorization: HTMLButtonElement = document.querySelector('.header__authorization');
export const userBtn: HTMLButtonElement = document.querySelector('.user');
export const sidebar: HTMLElement = document.querySelector('.sidebar');
export const sidebarLinkList: HTMLAnchorElement = sidebar.querySelector('sidebar__link-list');
export const sidebarLinkTrash: HTMLAnchorElement = sidebar.querySelector('sidebar__link-trash');
export const sidebarLinkSettings: HTMLAnchorElement = sidebar.querySelector('sidebar__link-settings');
export const modalNewList: HTMLDivElement = document.querySelector('.modal-new-list');
export const modalRenameList: HTMLDivElement = document.querySelector('.modal-rename-list');
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
export const logOutExit: HTMLButtonElement = logOut.querySelector('.log-out__exit');

export function toggleAuthDom(): void {
  console.log(setUser.user);

  if (setUser.user) {
    headerAuthorization.style.display = 'none';
    userBtn.style.display = '';
    authorization.classList.remove('authorization__is-open');
  } else {
    console.log('no setUser');

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

  authorizationBtnSignUp.addEventListener('click', function (event) {
    event.preventDefault();
    setUser.signUp(authorizationInputEmail.value, authorizationInputPass.value);
  });

  userBtn.addEventListener('click', function () {
    logOut.classList.add('log-out__is-open');
  });

  logOutBtn.addEventListener('click', function () {
    logOut.classList.remove('log-out__is-open');
    setUser.logOut();
  });

  logOutExit.addEventListener('click', function () {
    logOut.classList.remove('log-out__is-open');
  });

  authorizationBtnSignIn.addEventListener('click', function (event) {
    event.preventDefault();
    setUser.signIn(authorizationInputEmail.value, authorizationInputPass.value);
  });
};
