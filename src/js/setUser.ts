import { firebase } from '../index';
import { regExpValidEmail, toggleAuthDom, logOutEmail, userBtn, contentElem } from './utils';
import { render } from './render';

interface IsetUser {
  user: object | null;
  initUser(): void;
  signIn(email: string, password: string): void;
  signUp(email: string, password: string): void;
  logOut(): void;
  updateUserInfo(): void;
  // updateDisplayName(newDisplayName: string): void;
  sendForget(email: string): void;
}

export const setUser: IsetUser = {
  user: null,
  initUser() {
    firebase.auth().onAuthStateChanged(() => {
      this.user = firebase.auth().currentUser;
      toggleAuthDom();

      if (this.user) {
        if (this.user.displayName) {
          this.updateUserInfo();
        }

        let uid = (setUser.user as any).uid;
        contentElem.classList.add('lists');

        firebase
          .database()
          .ref(`${uid}/lists`)
          .on('value', (snapshot) => {
            let dbLists = snapshot.val() || [];

            if (contentElem.classList.contains('lists')) render.lists(dbLists);
            // render.lists(dbLists)
            // if (contentElem.classList.contains('list')) render.list(0);
          });
      } else {
        contentElem.className = 'content';
      }
    });
  },

  signIn(email: string, password: string) {
    if (!regExpValidEmail.test(email)) return alert('Email is not valid');

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((err) => {
        const errCode = err.code;
        const errMessage = err.message;

        if (errCode === 'auth/wrong-password') {
          alert('Wrong password');
        } else if (errCode == 'auth/user-not-found') {
          alert('User not found');
        } else {
          alert(errMessage);
        }
      });
  },

  signUp(email: string, password: string) {
    if (!regExpValidEmail.test(email)) {
      alert('email is not valid');
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
        const userName: string = email.substring(0, email.indexOf('@'));

        firebase
          .auth()
          .currentUser.updateProfile({ displayName: userName })
          .then(() => {
            this.updateUserInfo();

            let dbUsers: string[] = [];

            firebase
              .database()
              .ref('users')
              .get()
              .then((snapshot) => {
                dbUsers = snapshot.val() || [];
                dbUsers.push(email);
                firebase.database().ref(`users`).set(dbUsers);
              });
          });
      })
      .catch((err) => {
        const errCode = err.code;
        const errMessage = err.message;

        if (errCode === 'auth/weak-password') {
          alert('Слабый пароль');
        } else if (errCode == 'auth/email-already-in-use') {
          alert('Этот email уже используется');
        } else {
          console.log(err);
          console.log(errCode);
          console.log(errMessage);
        }
      });
  },

  logOut() {
    firebase.auth().signOut();
  },

  sendForget(email) {
    if (!regExpValidEmail.test(email)) return alert('email is not valid');

    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        alert('Письмо отправлено');
      })
      .catch((err) => {
        if (err.code == 'auth/user-not-found') {
          alert('User not found');
        } else {
          alert(err.message);
        }
      });
  },

  updateUserInfo() {
    userBtn.innerHTML = (this.user as any).displayName[0].toUpperCase();
    logOutEmail.innerHTML = this.user.email;
  },

  // updateDisplayName(newDisplayName: string) {
  //   const oldDisplayName: string | null = this.user.displayName || null;

  //   const updateInfo = (): void => {
  //     userBtn.innerHTML = (this.user as any).displayName[0].toUpperCase();
  //   };

  //   if (oldDisplayName === newDisplayName) {
  //     this.user.updateProfile({ displayName: newDisplayName }).then(updateInfo);
  //   } else {
  //     updateInfo();
  //   }
  // },
};
