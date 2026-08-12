# LOGICKlub

[report](https://docs.google.com/document/d/1D2tq8UYtxX9eCiQurjJTyIvsvn36X9Ez4vTfpB-tkf4/edit?usp=sharing)

[presentation](https://docs.google.com/presentation/d/1_R8CxTHcr-Eew4daF4Pk1WIiDnkruNDncPQrk0c73ZU/edit?usp=sharing)

## Main Goal
Build a multi-page frontend community website named **LOGICKlub** for logic, coding, AI, and creative technology enthusiasts.

## 🛠 Tech Stack
- **Overall**: VanillaJS (HTML5 / CSS3 / JavaScript)
- **UI Layout**: Bootstrap 5.3 (via CDN)
- **Interactivity & Network**: jQuery 3.7 (via CDN) & AJAX
- **Authentication**: Firebase Authentication (via CDN modules)
- **Storage**: Cookies, LocalStorage, SessionStorage

---

## Project Structure & Division of Labor

The project consists of 8 pages, collaboratively developed by 4 members.

### Member 1: Core Portal & Auth State
- **`index.html` (Home & Dashboard)**: The main landing page and user dashboard.
- **`join.html` (Interactive Registration)**: A comprehensive registration form featuring HTML5 validation and DOM manipulation.

### Member 2: Live Integrations & Scheduling
- **`events.html` (Live AI News & Events)**: Fetches news articles dynamically from a public RESTful API (via jQuery AJAX) and embeds social plugins.
- **`workshops.html` (Workshop Seat Reservation)**: An interactive seat reservation grid utilizing CSS Flexbox/Grid and DOM events.

### Member 3: Projects & Support
- **`projects.html` (Innovation Showcase & Upvoting)**: A project grid supporting dynamic upvoting that automatically re-sorts the list using JavaScript Array and Object manipulation.
- **`contact.html` (Feedback Hub & Support)**: A feedback form and contact channel allowing users to submit feedback.

### Khor Yu Zhuang: Interactive Learning
- **`math.html` (Linear Algebra Visualizer)**: An interactive 2D visualization of matrix transformations and basis vectors, illustrating how neural networks warp data spaces.
- **`game.html` (AI Training Simulator)**: An idle-clicker game implemented purely in JavaScript where users gather data to train an AI model, featuring an animated loss curve, Storage APIs, and real-world data injection via AJAX.

---

## Shared Modules & State
To ensure consistency across the entire website, the following modules are shared:

1. **Global Theme Switcher**: A shared navigation/header button (included on all HTML pages) that toggles the site-wide theme between light and midnight modes. The selection is stored in `Cookies` or `LocalStorage` and dynamically applied to all pages.
2. **Global Auth State**: Firebase Authentication state observer to check if a user is logged in (used by pages that require authentication context).
3. **CDN Dependencies**:
   - Bootstrap 5.3 CSS & JS (for responsive design and standard components)
   - jQuery 3.7 (for DOM manipulation and event handling)
   - Firebase Auth SDK (via browser ESM CDN imports)


