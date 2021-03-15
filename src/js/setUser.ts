import { firebase } from '../index';
import { regExpValidEmail, toggleAuthDom, logOutEmail, userBtn, contentElem } from './utils';
import { render } from './render';
import { IsetUser, Iuser } from './interfaces';

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

        let uid = (setUser.user as Iuser).uid;
        contentElem.classList.add('lists');

        firebase
          .database()
          .ref(`${uid}/lists`)
          .on('value', (snapshot) => {
            let dbLists = snapshot.val() || [];

            if (contentElem.classList.contains('lists')) render.lists(dbLists);
          });
      } else {
        contentElem.className = 'content';
        render.helloScreen();
      }
    });
  },

  signIn(email, password) {
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

  signUp(email, password) {
    if (!regExpValidEmail.test(email)) return alert('email is not valid');

    if (!email.trim() || !password.trim()) return alert('Введите даные');

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        const userName: string = email.substring(0, email.indexOf('@'));

        firebase
          .auth()
          .currentUser.updateProfile({ displayName: userName })
          .then(() => {
            this.updateUserInfo();
            // firebase
            //   .database()
            //   .ref('users')
            //   .get()
            //   .then((snapshot) => {
            //     const dbUsersSnapshot = snapshot.val() || [];
            //     dbUsersSnapshot.push(email);
            //     firebase.database().ref(`users`).set(dbUsersSnapshot);
            //   });
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
          alert(errMessage);
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
    userBtn.innerHTML = this.user.displayName[0].toUpperCase();
    logOutEmail.innerHTML = this.user.email;
  },
};
