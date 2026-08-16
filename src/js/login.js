import { auth } from "./auth.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const pwdInput = document.getElementById("login-pwd");

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

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
                loginForm.reset();
                window.location.href = "index.html";
            })
            .catch((error) => {
                console.error("Error signing in:", error.code, error.message);
                alert("Error: " + error.message);
            });
    });
}
