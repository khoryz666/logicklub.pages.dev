const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function (e) {
	e.preventDefault();

	const name = document.getElementById("name").value.trim();
	const email = document.getElementById("email").value.trim();
	const message = document.getElementById("message").value.trim();

	if (name === "" || email === "" || message === "") {
		alert("Please fill in all fields.");
		return;
	}

	alert(
		"Thank you, " + name + "! Your message has been sent. We will get back to you within 1–3 working days."
	);

	contactForm.reset();
});