# LOGICKlub Developer Guide

## 🛠️ Prerequisites
- **Editor**: VS Code with the **Live Server** extension.
- **Browser**: Chrome/Firefox. Use **F12** for Developer Tools (Console/Network tabs).

## 📂 Project Structure
- `/src` - HTML files (`index.html`, `join.html`, etc.)
- `/src/css` - Custom stylesheets (`style.css`, `theme.css`)
- `/src/js` - Scripts (`auth.js`, `projects.js`)
- `/src/assets` - Images and fonts

## 🚀 Phase-by-Phase Cheat Sheet

**Phase 1: Boilerplate**
- Set up standard HTML5 `<!DOCTYPE html>`.
- Link **Bootstrap 5** and **jQuery** CDNs in the `<head>`.
- Build the Navbar and Footer once, then duplicate exactly across pages.

**Phase 2: Global State**
- **Theme**: Toggle `.dark-theme` class on `<body>`. Save the choice in `localStorage`.
- **Auth**: Initialize Firebase v9. Use `onAuthStateChanged` to show/hide "Login" vs "Dashboard".

**Phase 3: Core Portal**
- **join.html**: Use HTML5 validation (`type="email"`, `required`). Send data to Firebase `createUserWithEmailAndPassword`.
- **index.html**: Use Bootstrap Grid (Rows/Cols) and Flexbox for responsive layout.

**Phase 4: Integrations**
- **events.html**: Use `fetch()` or jQuery `$.ajax()` to pull JSON from a REST API. Dynamically build and append HTML cards via JS.
- **workshops.html**: Design a seating chart using **CSS Grid**. Save selected seats in `sessionStorage` so they survive accidental refreshes.

**Phase 5: Community**
- **projects.html**: Store project data in a JS Array of Objects. On upvote: update the object, run `array.sort()`, and re-render the list.
- **contact.html**: Validate input string lengths using JS before processing.

**Phase 6: Interactive**
- **math.html**: Use HTML `<canvas>` or DOM manipulation to draw linear algebra concepts.
- **game.html**: Use `requestAnimationFrame` to run a smooth JS game loop.

## 🐞 Quick Debugging
1. **Console (F12)**: Check for red error text and identify the broken line number.
2. **Network (F12)**: Inspect API calls to ensure a 200 OK status instead of 404/403.
3. **Elements (F12)**: Check if your JS actually injected the expected HTML into the DOM.
4. **Logs**: Use `console.log(variable)` aggressively to trace your logic.
