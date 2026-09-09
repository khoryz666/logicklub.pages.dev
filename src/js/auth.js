// Self-contained member "auth" backed entirely by localStorage — no external
// service, no account, no bill. Good enough for a static class-project demo;
// it is NOT a substitute for a real server-side auth system (anyone with
// console access can read localStorage), but no data ever leaves the browser.

const USERS_KEY = "lk_users";
const SESSION_KEY = "lk_session";
const AUTH_EVENT = "lk-auth-change";

export class AuthError extends Error {
	constructor(code, message) {
		super(message);
		this.code = code;
	}
}

function loadUsers() {
	try {
		return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
	} catch (e) {
		return [];
	}
}

function saveUsers(users) {
	localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// SHA-256 via the browser's built-in Web Crypto API — no external library needed.
async function hashPassword(password) {
	const data = new TextEncoder().encode(password);
	const digest = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function toPublicUser(user) {
	if (!user) return null;
	return { fullName: user.fullName, username: user.username, email: user.email };
}

// The signed-in session lives in sessionStorage (cleared when the tab
// closes) — the account list itself still lives in localStorage below, since
// that's the only way a returning member can sign back in on a later visit.
function getSession() {
	try {
		return JSON.parse(sessionStorage.getItem(SESSION_KEY));
	} catch (e) {
		return null;
	}
}

function setSession(user) {
	if (user) {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(toPublicUser(user)));
	} else {
		sessionStorage.removeItem(SESSION_KEY);
	}
	window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

export function getCurrentUser() {
	return getSession();
}

// Calls back immediately with the current session, then again whenever it
// changes in this tab (sessionStorage isn't shared across tabs, so there's
// no cross-tab event to listen for).
export function onAuthStateChanged(callback) {
	callback(getCurrentUser());
	window.addEventListener(AUTH_EVENT, () => callback(getCurrentUser()));
}

export async function registerUser({ fullName, studentId, phone, programme, interest, username, email, password }) {
	const users = loadUsers();
	const usernameLower = username.trim().toLowerCase();
	const emailLower = email.trim().toLowerCase();

	if (users.some((u) => u.usernameLower === usernameLower)) {
		throw new AuthError("username-in-use", "That username is already in use. Please choose another one.");
	}
	if (users.some((u) => u.emailLower === emailLower)) {
		throw new AuthError("email-in-use", "This email is already registered. Please sign in instead.");
	}

	const user = {
		fullName,
		studentId,
		phone,
		programme,
		interest,
		username,
		usernameLower,
		email,
		emailLower,
		passwordHash: await hashPassword(password)
	};

	users.push(user);
	saveUsers(users);
	return toPublicUser(user);
}

export async function signIn(identifier, password) {
	const value = identifier.trim().toLowerCase();
	const users = loadUsers();
	const user = value.includes("@")
		? users.find((u) => u.emailLower === value)
		: users.find((u) => u.usernameLower === value);

	if (!user) {
		throw new AuthError("not-found", "No registered member account was found. Please sign up first.");
	}

	const passwordHash = await hashPassword(password);
	if (passwordHash !== user.passwordHash) {
		throw new AuthError("wrong-password", "Incorrect email/username or password.");
	}

	setSession(user);
	return toPublicUser(user);
}

export function signOut() {
	setSession(null);
	return Promise.resolve();
}

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
	  This website uses Cookies and Local Storage to remember your preferences and membership sign-in.
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
