import './scss/style.css';

export const firebase = window.firebase;
firebase.initializeApp({
  apiKey: "AIzaSyBWD1NHPb3KwMzsvX05WLUPqxWMgC2RLTw",
  authDomain: "buylist-b265a.firebaseapp.com",
  databaseURL: "https://buylist-b265a-default-rtdb.firebaseio.com",
  projectId: "buylist-b265a",
  storageBucket: "buylist-b265a.appspot.com",
  messagingSenderId: "753800425123",
  appId: "1:753800425123:web:c4e4e589ba986cf1511916"
});

import {init} from './js/app.ts';
init();
