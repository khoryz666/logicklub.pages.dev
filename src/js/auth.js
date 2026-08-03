// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-analytics.js";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyB-_9QzsRnfRR1I1dz1cI8VqNQgkaHVF9Q",

  authDomain: "logicklub-3f1d5.firebaseapp.com",

  projectId: "logicklub-3f1d5",

  storageBucket: "logicklub-3f1d5.firebasestorage.app",

  messagingSenderId: "336053964862",

  appId: "1:336053964862:web:88cff2ccd845e71133016f",

  measurementId: "G-J32HPYL0QB"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);