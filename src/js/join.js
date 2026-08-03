import { auth } from "./auth.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

const joinForm = document.getElementById("join-form");
const emailInput = document.getElementById("user-email");
const pwdInput = document.getElementById("user-pwd");
const signInBtn = document.getElementById("sign-in-btn");

if (joinForm) {

    joinForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const pwd = pwdInput.value;

        createUserWithEmailAndPassword(auth, email, pwd)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Successfully created user:", user.email);
                joinForm.reset();
            })
            .catch((error) => {
                console.error("Error creating user:", error.code, error.message);
                alert("Error: " + error.message);
            });
    });
}

if (signInBtn) {
    signInBtn.addEventListener("click", () => {
        const email = emailInput.value;
        const pwd = pwdInput.value;

        if (!email || !pwd) {
            alert("Please enter both email and password to sign in.");
            return;
        }

        signInWithEmailAndPassword(auth, email, pwd)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Successfully signed in user:", user.email);
                joinForm.reset();
            })
            .catch((error) => {
                console.error("Error signing in:", error.code, error.message);
                alert("Error: " + error.message);
            });
    });
}