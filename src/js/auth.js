// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-_9QzsRnfRR1I1dz1cI8VqNQgkaHVF9Q",
  authDomain: "logicklub-3f1d5.firebaseapp.com",
  projectId: "logicklub-3f1d5",
  storageBucket: "logicklub-3f1d5.firebasestorage.app",
  messagingSenderId: "336053964862",
  appId: "1:336053964862:web:88cff2ccd845e71133016f",
  measurementId: "G-J32HPYL0QB"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);


onAuthStateChanged(auth, (user) => {
  const authStatus = document.getElementById("auth-status");
  const joinForm = document.getElementById("join-form");
  const signedInEmail = document.getElementById("signed-in-email");

  if (user) {
    if (authStatus) authStatus.style.display = "block";
    if (joinForm) joinForm.style.display = "none";
    if (signedInEmail) signedInEmail.innerText = user.email;
  } else {
    if (authStatus) authStatus.style.display = "none";
    if (joinForm) joinForm.style.display = "block";
    if (signedInEmail) signedInEmail.innerText = "";
  }
});

const signOutBtn = document.getElementById("sign-out-btn");
if (signOutBtn) {
  signOutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      console.log("User successfully signed out.");
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  });
}