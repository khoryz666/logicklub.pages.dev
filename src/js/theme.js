// Theme persistence shim.
// The floating navbar (js/bar.js) provides the actual sun/moon toggle button;
// this script only restores the saved theme on page load, so pages that
// reference it keep the user's previous choice without a flash of wrong theme.
(function () {
	"use strict";
	var root = document.documentElement;
	try {
		var saved = localStorage.getItem("theme");
		if (saved === "light" || saved === "dark") {
			root.setAttribute("data-theme", saved);
		}
	} catch (e) { /* ignore */ }
})();
