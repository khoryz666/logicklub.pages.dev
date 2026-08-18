const filterButtons = document.querySelectorAll("[data-filter]");
const projects = document.querySelectorAll("[data-category]");

const FILTER_KEY = "logicklubProjectFilter";

function applyFilter(filter) {
	filterButtons.forEach(button => {
		button.classList.toggle("active", button.dataset.filter === filter);
	});

	projects.forEach(project => {
		project.style.display = (filter === "all" || project.dataset.category === filter) ? "" : "none";
	});
}

filterButtons.forEach(button => {
	button.addEventListener("click", function () {
		const filter = this.dataset.filter;

		applyFilter(filter);

		// Remember the chosen filter so a refresh keeps the user's view.
		try { sessionStorage.setItem(FILTER_KEY, filter); } catch (e) { /* ignore */ }
	});
});

// Restore the previously selected filter (defaults to "all").
let savedFilter = null;
try { savedFilter = sessionStorage.getItem(FILTER_KEY); } catch (e) { savedFilter = null; }

const savedIsValid = Array.prototype.some.call(filterButtons, b => b.dataset.filter === savedFilter);
applyFilter(savedIsValid ? savedFilter : "all");
