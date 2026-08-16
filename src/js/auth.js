// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

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
export const db = getFirestore(app);

// --- COOKIE & STORAGE CONSENT BANNER ---
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("consentAcknowledged")) {
    const banner = document.createElement("div");
    banner.style.position = "fixed";
    banner.style.bottom = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.backgroundColor = "#222";
    banner.style.color = "white";
    banner.style.padding = "15px";
    banner.style.textAlign = "center";
    banner.style.zIndex = "1000";
    banner.innerHTML = `
      <p style="display:inline; margin-right: 15px;">
        This website uses Local Storage and Firebase Authentication to ensure you get the best experience.
      </p>
      <button id="consent-btn" style="padding: 5px 15px;">I Understand</button>
    `;
    document.body.appendChild(banner);

    document.getElementById("consent-btn").addEventListener("click", () => {
      localStorage.setItem("consentAcknowledged", "true");
      banner.remove();
    });
  }
});


onAuthStateChanged(auth, (user) => {
  const authStatus = document.getElementById("auth-status");
  const joinForm = document.getElementById("join-form");
  const signedInEmail = document.getElementById("signed-in-email");
  const nav = document.querySelector("nav");

  if (nav) {
    // Remove the hardcoded "Join Us" link from all pages
    const oldJoinLink = Array.from(nav.querySelectorAll('a')).find(a => a.getAttribute('href') === 'join.html' || a.textContent.trim() === 'Join Us');
    if (oldJoinLink) oldJoinLink.remove();


    // Setup or get the auth container
    let authContainer = document.getElementById("global-auth-container");
    if (!authContainer) {
      authContainer = document.createElement("div");
      authContainer.id = "global-auth-container";
      authContainer.style.marginLeft = "auto";
      authContainer.style.display = "flex";
      authContainer.style.alignItems = "center";
      authContainer.style.gap = "10px";
      authContainer.style.fontSize = "14px";
      authContainer.style.color = "#afbdd1";
      authContainer.style.whiteSpace = "nowrap";
      nav.appendChild(authContainer);
    }

    if (user) {
      authContainer.innerHTML = `Hi, <strong style="color: #fff;">${user.displayName || user.email}</strong> <a href="#" id="global-signout-btn">Sign Out</a>`;
      document.getElementById("global-signout-btn").addEventListener("click", (e) => {
        e.preventDefault();
        signOut(auth).then(() => window.location.reload());
      });
    } else {
      authContainer.innerHTML = `<a href="join.html">Sign Up / Sign In</a>`;
    }
  }

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