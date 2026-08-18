const contactForm = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

// Load saved data from localStorage when page loads
document.addEventListener("DOMContentLoaded", function () {
  const savedData = JSON.parse(localStorage.getItem("contactFormData"));

  if (savedData) {
    nameInput.value = savedData.name || "";
    emailInput.value = savedData.email || "";
    messageInput.value = savedData.message || "";
  }
});

// Save form inputs to localStorage automatically as the user types
function saveFormData() {
  const formData = {
    name: nameInput.value,
    email: emailInput.value,
    message: messageInput.value
  };

  localStorage.setItem("contactFormData", JSON.stringify(formData));
}

// Attach input listeners
nameInput.addEventListener("input", saveFormData);
emailInput.addEventListener("input", saveFormData);
messageInput.addEventListener("input", saveFormData);

// Update the submit event listener
contactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  if (name === "" || email === "" || message === "") {
    alert("Please fill in all fields.");
    return;
  }

  alert(
    "Thank you, " + name + "! Your message has been sent. We will get back to you within 1–3 working days."
  );

  // Clear local storage and reset the form
  localStorage.removeItem("contactFormData");
  contactForm.reset();
});

// Keep the embedded X timeline in sync with the global theme switcher.
function updateTimelineTheme() {
  const timeline = document.querySelector(".twitter-timeline");
  if (!timeline) return;

  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  timeline.setAttribute("data-theme", theme === "light" ? "light" : "dark");

  if (window.twttr && window.twttr.widgets && window.twttr.widgets.load) {
    window.twttr.widgets.load();
  }
}

document.addEventListener("DOMContentLoaded", updateTimelineTheme);
window.addEventListener("load", updateTimelineTheme);
document.addEventListener("logicklub-theme-change", updateTimelineTheme);