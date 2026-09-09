import { registerUser, signIn, signOut, onAuthStateChanged, AuthError } from "./auth.js";

const joinForm = document.getElementById("join-form");
const formMessage = document.getElementById("form-message");
const description = document.getElementById("join-description");

const signUpPanel = document.getElementById("sign-up-panel");
const signInPanel = document.getElementById("sign-in-panel");
const showSignUpBtn = document.getElementById("show-sign-up");
const showSignInBtn = document.getElementById("show-sign-in");

const fullNameInput = document.getElementById("full-name");
const studentIdInput = document.getElementById("student-id");
const phoneInput = document.getElementById("phone-number");
const programmeInput = document.getElementById("programme");
const interestInput = document.getElementById("interest");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("user-email");
const pwdInput = document.getElementById("user-pwd");
const confirmPwdInput = document.getElementById("confirm-pwd");

const loginIdentifierInput = document.getElementById("login-identifier");
const loginPasswordInput = document.getElementById("login-password");

let currentMode = "signup";

function setMessage(message, type = "info") {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = type === "error" ? "form-error" : type === "success" ? "form-success" : "";
}

function setMode(mode) {
    currentMode = mode;
    const isSignUp = mode === "signup";

    signUpPanel.hidden = !isSignUp;
    signInPanel.hidden = isSignUp;
    showSignUpBtn.classList.toggle("active", isSignUp);
    showSignInBtn.classList.toggle("active", !isSignUp);

    // Disable fields in the hidden mode so browser validation never blocks the active form.
    signUpPanel.querySelectorAll("input, select, button").forEach((el) => {
        el.disabled = !isSignUp;
    });
    signInPanel.querySelectorAll("input, button").forEach((el) => {
        el.disabled = isSignUp;
    });

    description.textContent = isSignUp
        ? "New to LOGICKlub? Create your member account by filling in the information below."
        : "Already a member? Sign in using your registered email or username and password.";

    setMessage("");
}

showSignUpBtn?.addEventListener("click", () => setMode("signup"));
showSignInBtn?.addEventListener("click", () => setMode("signin"));

// In sign-in mode the form's default submit button (Sign Up) is disabled,
// which blocks the browser's implicit Enter-to-submit. Route Enter presses
// in the sign-in panel through requestSubmit() so both keyboard and mouse work.
signInPanel?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        joinForm.requestSubmit();
    }
});

if (joinForm) {
    joinForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Pressing Enter (or clicking the submit button) in sign-in mode
        // routes to the sign-in handler instead of the sign-up handler.
        if (currentMode === "signin") {
            handleSignIn();
            return;
        }

        const fullName = fullNameInput.value.trim();
        const studentId = studentIdInput.value.trim();
        const phone = phoneInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const pwd = pwdInput.value;
        const confirmPwd = confirmPwdInput.value;

        if (!fullName || !studentId || !phone || !username || !email || !pwd || !confirmPwd) {
            setMessage("Please complete all required registration fields.", "error");
            return;
        }

        if (username.length < 3) {
            setMessage("Username must contain at least 3 characters.", "error");
            return;
        }

        if (!/^[A-Za-z0-9._-]+$/.test(username)) {
            setMessage("Username may only contain letters, numbers, dots, underscores and hyphens.", "error");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setMessage("Please enter a valid email address.", "error");
            return;
        }

        if (pwd.length < 6) {
            setMessage("Password must contain at least 6 characters.", "error");
            return;
        }

        if (pwd !== confirmPwd) {
            setMessage("Passwords do not match.", "error");
            return;
        }

        try {
            await registerUser({
                fullName,
                studentId,
                phone,
                programme: programmeInput.value.trim(),
                interest: interestInput.value,
                username,
                email,
                password: pwd
            });

            joinForm.reset();
            setMode("signin");
            setMessage("Registration successful. Please sign in with your new account.", "success");
            loginIdentifierInput.value = username;
            loginIdentifierInput.focus();
        } catch (error) {
            if (error instanceof AuthError) {
                setMessage(error.message, "error");
            } else {
                console.error("Error creating user:", error);
                setMessage("Registration failed. Please try again.", "error");
            }
        }
    });
}

async function handleSignIn() {
    const identifier = loginIdentifierInput.value.trim();
    const pwd = loginPasswordInput.value;

    if (!identifier || !pwd) {
        setMessage("Please enter both your email/username and password.", "error");
        return;
    }

    try {
        await signIn(identifier, pwd);
        joinForm.reset();
        setMessage("Sign in successful. Redirecting...", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 900);
    } catch (error) {
        if (error instanceof AuthError) {
            setMessage(error.message, "error");
        } else {
            console.error("Error signing in:", error);
            setMessage("Sign in failed. Please check your account details and try again.", "error");
        }
    }
}

// Reflect the auth state on this page: hide the form and show a "signed in
// as" panel with a sign-out button once a member is signed in.
const authStatus = document.getElementById("auth-status");
const signedInEmail = document.getElementById("signed-in-email");
const signOutBtn = document.getElementById("sign-out-btn");

onAuthStateChanged((user) => {
    if (authStatus) authStatus.style.display = user ? "block" : "none";
    if (joinForm) joinForm.style.display = user ? "none" : "block";
    if (signedInEmail) signedInEmail.textContent = user ? user.email : "";
});

signOutBtn?.addEventListener("click", () => {
    signOut().then(() => console.log("User successfully signed out."));
});

setMode("signup");
