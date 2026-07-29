# LOGICKlub

[report](https://docs.google.com/document/d/1D2tq8UYtxX9eCiQurjJTyIvsvn36X9Ez4vTfpB-tkf4/edit?usp=sharing)

[presentation](https://docs.google.com/presentation/d/1_R8CxTHcr-Eew4daF4Pk1WIiDnkruNDncPQrk0c73ZU/edit?usp=sharing)

## Main Goal
Build a multi-page frontend community website named **LOGICKlub** for logic, coding, AI, and creative technology enthusiasts.

## Tech Stack 
*   **Overall**: VanillaJS (HTML/CSS/JS)
*   **UI Layout**: Bootstrap 5.3 (via CDN)
*   **Interactivity & Network**: jQuery 3.7 (via CDN)
*   **Authentication**: Firebase Authentication (via CDN modules)
*   **High-Performance Engine**: Rust compiled to WebAssembly (`wasm-pack`)

---

## Project Structure & Division of Labor

The project consists of 8 pages, collaboratively developed by 4 members.

### Member 1: Core Portal & Auth State
*   **`index.html` (Home & Dashboard)**
    *   **Effect**: Home dashboard page. Integrates **Firebase Auth Sign-In / Sign-Out** to dynamically show/hide dashboard modules, alongside a Bootstrap Carousel and Cookie-based first-visit welcome alert.
*   **`join.html` (Interactive Registration)**
    *   **Effect**: Multi-step registration form with a progress bar. Integrates **Firebase Auth Sign-Up** to register new users, and uses `SessionStorage` to temporarily persist form inputs before submission.

### Member 2: Live Integrations & Scheduling
*   **`events.html` (Live AI News & Events)**
    *   **Effect**: Dynamic feed cards with a real-time text filter. Uses jQuery `$.ajax()` to fetch news articles from a public API and embeds social plugins (e.g., Twitter/X feed).
*   **`workshops.html` (Workshop Seat Reservation)**
    *   **Effect**: Interactive seat reservation grid. Uses `LocalStorage` to persist the array of booked workshops across page navigations.

### Member 3: Projects & Support
*   **`projects.html` (Innovation Showcase & Upvoting)**
    *   **Effect**: Project grid supporting dynamic upvoting that automatically re-sorts the list. Uses `LocalStorage` to prevent multiple upvotes on the same project.
*   **`contact.html` (Feedback Hub & Support)**
    *   **Effect**: Feedback form and contact channel allowing users to submit feedback and suggestions.

### Khor Yu Zhuang: Coding Challenges & WebAssembly
*   **`quiz.html` (Coding Quiz Challenge)**
    *   **Effect**: Interactive programming and logic quiz. Uses jQuery `$.ajax()` to dynamically fetch coding questions from a public web API, displaying them sequentially with instant score tracking.
*   **`game.html` / `wasm-game.html` (Wasm Challenge Game)**
    *   **Effect**: HTML5 `<canvas>`-based interactive game. The core gameplay logic and loop calculations are powered by Rust compiled to WebAssembly.

---

## Shared Modules & State
To ensure consistency across the entire website, the following modules are shared:
1.  **Global Theme Switcher**: A shared navigation/header button (included on all HTML pages) that toggles the site-wide theme between light and midnight modes. The selection is stored in `Cookies` or `LocalStorage` and dynamically applied to all pages.
2.  **Global Auth State**: Firebase Authentication state observer to check if a user is logged in (used by pages that require authentication context).
3.  **CDN Dependencies**:
    *   Bootstrap 5.3 CSS & JS (for responsive design and standard components)
    *   jQuery 3.7 (for DOM manipulation and event handling)
    *   Firebase Auth SDK (via browser ESM CDN imports)

---

## How to Run
1.  **Open Pages**: Double-click any `.html` file to run it directly in your browser.
2.  **Compile Rust WebAssembly**:
    ```bash
    wasm-pack build --target web
    ```
    Copy the compiled `pkg/UCCD2323_wasm_bg.wasm` and `pkg/UCCD2323_wasm.js` files into the `/wasm` directory to be loaded by `game.html`.

