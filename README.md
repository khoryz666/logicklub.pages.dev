# LOGICKlub

[Report](https://docs.google.com/document/d/1D2tq8UYtxX9eCiQurjJTyIvsvn36X9Ez4vTfpB-tkf4/edit?usp=sharing) | [Presentation](https://canva.link/tpqe8yo31e0un9y) | [Architecture Diagram](https://app.diagrams.net/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=architecture.drawio#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fkhoryz666%2Flogicklub.pages.dev%2Fmain%2Farchitecture.drawio)

A multi-page community frontend for logic, coding, AI, and creative tech enthusiasts.

## Tech Stack
- **Core**: VanillaJS, HTML5, CSS3
- **Libraries**: Bootstrap 5.3 (Grid/UI), jQuery 3.7 (DOM/AJAX)
- **Services**: Firebase Auth, ONNX Runtime Web (WASM)
- **Storage**: Cookies & LocalStorage

## Pages & Features
- **Portal:** `index.html` (Dashboard) & `join.html` (Interactive Registration)
- **Events:** `events.html` (Live API News) & `workshops.html` (Interactive Seat Reservation)
- **Community:** `projects.html` (Project Gallery) & `contact.html` (Feedback Hub)
- **AI Demonstrations:**
    - **`math.html`**: Interactive 2D matrix transformation visualizer.
    - **`game.html`**: Draw digits (0-9) and classify them entirely client-side via a WebAssembly ONNX neural network.  
- **Global Theme Switcher**: Light/Dark mode persisted across all pages via LocalStorage.
- **Global Auth State**: Centralized Firebase observer handling user sessions.
