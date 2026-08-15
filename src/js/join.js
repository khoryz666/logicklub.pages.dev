import { auth, db } from "./auth.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const joinForm = document.getElementById("join-form");
const emailInput = document.getElementById("user-email");
const pwdInput = document.getElementById("user-pwd");
const confirmPwdInput = document.getElementById("confirm-pwd");
const signInBtn = document.getElementById("sign-in-btn");

const fullNameInput = document.getElementById("full-name");
const studentIdInput = document.getElementById("student-id");
const phoneInput = document.getElementById("phone-number");
const programmeInput = document.getElementById("programme");
const interestInput = document.getElementById("interest");

if (joinForm) {

    joinForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const pwd = pwdInput.value;

        if (pwd !== confirmPwdInput.value) {
            alert("Passwords do not match!");
            return;
        }

        createUserWithEmailAndPassword(auth, email, pwd)
            .then(async (userCredential) => {
                const user = userCredential.user;
                
                // Update Firebase Auth profile with full name
                await updateProfile(user, { displayName: fullNameInput.value });

                // Save extended details to Firestore Database
                await setDoc(doc(db, "users", user.uid), {
                    fullName: fullNameInput.value,
                    studentId: studentIdInput.value,
                    phone: phoneInput.value,
                    programme: programmeInput.value,
                    interest: interestInput.value,
                    email: email
                });

                console.log("Successfully created user & saved profile:", user.email);
                joinForm.reset();
                window.location.reload();
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