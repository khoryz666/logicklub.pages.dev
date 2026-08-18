import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

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
export const auth = getAuth(app);
export const db = getFirestore(app);

// Cookie / local-storage consent banner.
document.addEventListener("DOMContentLoaded", () => {
	if (localStorage.getItem("consentAcknowledged")) return;

	try {
		if (document.cookie.indexOf("lk_consent=") !== -1) return;
	} catch (e) { /* ignore */ }

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
		try {
			document.cookie = "lk_consent=1; max-age=31536000; path=/; SameSite=Lax";
		} catch (e) { /* ignore */ }
		banner.remove();
	});
});

// Reflect the auth state on the join page.
onAuthStateChanged(auth, (user) => {
	const authStatus = document.getElementById("auth-status");
	const joinForm = document.getElementById("join-form");
	const signedInEmail = document.getElementById("signed-in-email");

	if (user) {
		if (authStatus) authStatus.style.display = "block";
		if (joinForm) joinForm.style.display = "none";
		if (signedInEmail) signedInEmail.textContent = user.email;
	} else {
		if (authStatus) authStatus.style.display = "none";
		if (joinForm) joinForm.style.display = "block";
		if (signedInEmail) signedInEmail.textContent = "";
	}
});

const signOutBtn = document.getElementById("sign-out-btn");
if (signOutBtn) {
	signOutBtn.addEventListener("click", () => {
		signOut(auth)
			.then(() => console.log("User successfully signed out."))
			.catch((error) => console.error("Error signing out:", error));
	});
}
