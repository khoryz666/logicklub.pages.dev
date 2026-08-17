const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");

function showFeedback(message, type) {
  if (!formFeedback) return;

  formFeedback.textContent = message;
  formFeedback.className = `form-feedback ${type}`;
}

function clearFeedback() {
  if (!formFeedback) return;

  formFeedback.textContent = "";
  formFeedback.className = "form-feedback hidden";
}

contactForm.addEventListener("submit", function (e) {
  e.preventDefault();
  clearFeedback();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (name === "" || email === "" || message === "") {
    showFeedback("Please fill in all required fields.", "error");
    return;
  }

  showFeedback(
    `Thank you, ${name}! Your message has been sent. We will get back to you within 1–3 working days.`,
    "success"
  );

  contactForm.reset();
});