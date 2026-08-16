const filterButtons = document.querySelectorAll("[data-filter]");
const projects = document.querySelectorAll("[data-category]");

// Set default active filter state to 'All'
if (filterButtons.length > 0) {
  filterButtons[0].classList.add("active");
}

filterButtons.forEach(button => {
  button.addEventListener("click", function () {
    const filter = this.dataset.filter;

    // Remove active state from all buttons and add to the clicked one
    filterButtons.forEach(btn => btn.classList.remove("active"));
    this.classList.add("active");

    // Filter projects
    projects.forEach(project => {
      if (filter === "all" || project.dataset.category === filter) {
        project.style.display = "";
      } else {
        project.style.display = "none";
      }
    });
  });
});