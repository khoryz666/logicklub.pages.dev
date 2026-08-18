import { auth, db } from "./auth.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import {
    doc,
    setDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

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

const wizardSteps = document.querySelectorAll(".wizard-step");
const wizardDots = document.querySelectorAll(".wizard-dot");
const wizardNextBtn = document.getElementById("wizard-next");
const wizardBackBtn = document.getElementById("wizard-back");

const DRAFT_KEY = "logicklubJoinDraft";

let currentMode = "signup";

function setWizardStep(step) {
	wizardSteps.forEach((el) => {
		el.hidden = el.dataset.step !== String(step);
	});

	wizardDots.forEach((el) => {
		const n = Number(el.dataset.step);
		el.classList.toggle("active", n === step);
		el.classList.toggle("done", n < step);
	});
}

// Save non-password fields to sessionStorage so a refresh mid-registration
// keeps the draft. Passwords are deliberately excluded for security.
function saveDraft() {
	try {
		sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
			fullName: fullNameInput.value,
			studentId: studentIdInput.value,
			phone: phoneInput.value,
			programme: programmeInput.value,
			interest: interestInput.value,
			username: usernameInput.value,
			email: emailInput.value
		}));
	} catch (e) { /* ignore */ }
}

function restoreDraft() {
	let draft = null;
	try {
		draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
	} catch (e) {
		draft = null;
	}
	if (!draft) return;

	fullNameInput.value = draft.fullName || "";
	studentIdInput.value = draft.studentId || "";
	phoneInput.value = draft.phone || "";
	programmeInput.value = draft.programme || "";
	interestInput.value = draft.interest || "";
	usernameInput.value = draft.username || "";
	emailInput.value = draft.email || "";
}

function clearDraft() {
	try { sessionStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
}

[fullNameInput, studentIdInput, phoneInput, programmeInput, interestInput, usernameInput, emailInput].forEach((el) => {
	if (el) {
		el.addEventListener("input", saveDraft);
		el.addEventListener("change", saveDraft);
	}
});

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

	if (isSignUp) setWizardStep(1);

	description.textContent = isSignUp
		? "New to LOGICKlub? Create your member account by filling in the information below."
		: "Already a member? Sign in using your registered email or username and password.";

	setMessage("");
}

showSignUpBtn?.addEventListener("click", () => setMode("signup"));
showSignInBtn?.addEventListener("click", () => setMode("signin"));

if (wizardNextBtn) {
	wizardNextBtn.addEventListener("click", () => {
		const fullName = fullNameInput.value.trim();
		const studentId = studentIdInput.value.trim();
		const phone = phoneInput.value.trim();

		if (!fullName || !studentId || !phone) {
			setMessage("Please complete all required personal information fields.", "error");
			return;
		}

		setMessage("");
		setWizardStep(2);
	});
}

if (wizardBackBtn) {
	wizardBackBtn.addEventListener("click", () => setWizardStep(1));
}

// Pressing Enter on step 1 advances the wizard instead of submitting the form.
document.querySelector('.wizard-step[data-step="1"]')?.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		e.preventDefault();
		wizardNextBtn.click();
	}
});

// In sign-in mode the form's default submit button (Sign Up) is disabled,
// which blocks the browser's implicit Enter-to-submit. Route Enter presses
// in the sign-in panel through requestSubmit() so both keyboard and mouse work.
signInPanel?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        joinForm.requestSubmit();
    }
});

async function usernameExists(username) {
    const usernameQuery = query(
        collection(db, "users"),
        where("usernameLower", "==", username.trim().toLowerCase())
    );
    const snapshot = await getDocs(usernameQuery);
    return !snapshot.empty;
}

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

        if (pwd.length < 6) {
            setMessage("Password must contain at least 6 characters.", "error");
            return;
        }

        if (pwd !== confirmPwd) {
            setMessage("Passwords do not match.", "error");
            return;
        }

        try {
            if (await usernameExists(username)) {
                setMessage("That username is already in use. Please choose another one.", "error");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
            const user = userCredential.user;

            await updateProfile(user, { displayName: fullName });

            await setDoc(doc(db, "users", user.uid), {
                fullName,
                studentId,
                phone,
                programme: programmeInput.value.trim(),
                interest: interestInput.value,
                username,
                usernameLower: username.toLowerCase(),
                email
            });

            // Firebase automatically signs in a newly-created user. Sign them out so
            // registration does not count as a successful sign-in.
            await signOut(auth);

            joinForm.reset();
            clearDraft();
            setMode("signin");
            setMessage("Registration successful. Please sign in with your new account.", "success");
            loginIdentifierInput.value = username;
            loginIdentifierInput.focus();
        } catch (error) {
            console.error("Error creating user:", error.code, error.message);

            if (error.code === "auth/email-already-in-use") {
                setMessage("This email is already registered. Please sign in instead.", "error");
            } else if (error.code === "auth/invalid-email") {
                setMessage("Please enter a valid email address.", "error");
            } else if (error.code === "auth/weak-password") {
                setMessage("The password is too weak. Please use at least 6 characters.", "error");
            } else {
                setMessage("Registration failed. Please try again.", "error");
            }
        }
    });
}

async function resolveEmailFromIdentifier(identifier) {
    const value = identifier.trim();

    // If the user entered an email address, Firebase can authenticate it directly.
    if (value.includes("@")) return value;

    // Otherwise, look up the registered username and retrieve its email.
    const usernameQuery = query(
        collection(db, "users"),
        where("usernameLower", "==", value.toLowerCase())
    );
    const snapshot = await getDocs(usernameQuery);

    if (snapshot.empty) return null;
    return snapshot.docs[0].data().email || null;
}

async function handleSignIn() {
    const identifier = loginIdentifierInput.value.trim();
    const pwd = loginPasswordInput.value;

    if (!identifier || !pwd) {
        setMessage("Please enter both your email/username and password.", "error");
        return;
    }

    try {
        const email = await resolveEmailFromIdentifier(identifier);

        // An unknown username has no registered member account, so it must never sign in.
        if (!email) {
            setMessage("No registered member account was found. Please sign up first.", "error");
            return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, pwd);
        console.log("Successfully signed in user:", userCredential.user.email);
        joinForm.reset();
        clearDraft();
        setMessage("Sign in successful. Redirecting...", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 900);
    } catch (error) {
        console.error("Error signing in:", error.code, error.message);

        if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
            setMessage("Incorrect email/username or password. New members must sign up before signing in.", "error");
        } else if (error.code === "auth/invalid-email") {
            setMessage("Please enter a valid registered email or username.", "error");
        } else {
            setMessage("Sign in failed. Please check your account details and try again.", "error");
        }
    }
}

setMode("signup");
restoreDraft();
setWizardStep(1);