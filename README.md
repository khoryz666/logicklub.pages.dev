# LOGICKlub

A multi-page community frontend for logic, coding, AI, and creative tech enthusiasts.

## Tech Stack
- **Core**: VanillaJS, HTML5, CSS3
- **Libraries**: Bootstrap 5.3 (Grid/UI), jQuery 3.7 (DOM/AJAX)
- **Services**: ONNX Runtime Web (WASM)
- **Storage**: Cookies, LocalStorage & SessionStorage

## Pages & Features
- **Portal:** `index.html` (Dashboard) & `join.html` (Interactive Registration)
- **Events:** `events.html` (Live API News) & `workshops.html` (Interactive Seat Reservation)
- **Community:** `projects.html` (Project Gallery) & `contact.html` (Feedback Hub)
- **AI Demonstrations:**
    - **`math.html`**: Interactive 2D matrix transformation visualizer.
    - **`game.html`**: Draw digits (0-9) and classify them entirely client-side via a WebAssembly ONNX neural network.  
- **Global Theme Switcher**: Light/Dark mode persisted across all pages via LocalStorage.
- **Global Auth State**: Client-only member accounts — no backend, no third-party auth service. Accounts and SHA-256 password hashes (via the browser's Web Crypto API) persist in LocalStorage so members can sign back in on a later visit; the active sign-in itself lives in SessionStorage and clears when the tab closes. A centralized observer in `auth.js` drives the nav bar's signed-in state across every page.
