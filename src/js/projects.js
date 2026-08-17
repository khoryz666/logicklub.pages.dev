const filterButtons = document.querySelectorAll("[data-filter]");
const projects = document.querySelectorAll("[data-category]");

filterButtons.forEach(button => {
	button.addEventListener("click", function () {
		const filter = this.dataset.filter;

		filterButtons.forEach(b => b.classList.remove("active"));
		this.classList.add("active");

		projects.forEach(project => {
			project.style.display = (filter === "all" || project.dataset.category === filter) ? "" : "none";
		});
	});
});
