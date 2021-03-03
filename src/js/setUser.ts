import { firebase } from '../index';
import { regExpValidEmail, toggleAuthDom } from './utils';

interface IsetUser {
  user: object | null;
  initUser(): void;
  logIn(email: string, password: string): void;
  logOut(): void;
  signUp(email: string, password: string): void,
  updateDisplayName(newDisplayName: string): void,
  sendForget(email: string): void,
}

export const setUser: IsetUser = {
  user: null,

  initUser() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }

      toggleAuthDom();
    });
  },

  logIn(email, password) {
    if (!regExpValidEmail.test(email)) return alert('email не валиден');

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((err) => {
        const errCode = err.code;
        const errMessage = err.messege;

        if (errCode === 'auth/wrong-password') {
          alert('Неверный пароль');
        } else if (errCode == 'auth/user-not-found') {
          alert('Пользователь не найден');
        } else {
          alert(errMessage);
        }
      });
  },

  logOut() {
    firebase.auth().signOut();
  },

  signUp(email, password) {
    if (!regExpValidEmail.test(email)) {
      alert('email не валиден');
      return;
    }

    if (!email.trim() || !password.trim()) {
      alert('Введите даные');
      return;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((data) => {
        let userName = email.substring(0, email.indexOf('@'));

        this.updateDisplayName(userName).then(toggleAuthDom);
      })
      .catch((err) => {
        const errCode = err.code;
        const errMessage = err.messege;

        if (errCode === 'auth/weak-password') {
          alert('Слабый пароль');
        } else if (errCode == 'auth/email-already-in-use') {
          alert('Этот email уже используется');
        } else {
          alert(errMessage);
        }
      });
  },

  updateDisplayName(newDisplayName) {
    const user = firebase.auth().currentUser;
    return user.updateProfile({ displayName: newDisplayName });
  },

  sendForget(email) {
    if (!regExpValidEmail.test(email)) return alert('email is not valid');

    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert('Письмо отправлено');
    })
    .catch(err => {
      alert(err.messege);
    })
  }
};
