const filterButtons = document.querySelectorAll("[data-filter]");
const projects = document.querySelectorAll("[data-category]");

filterButtons.forEach(button => {
  button.addEventListener("click", function () {

    const filter = this.dataset.filter;

    projects.forEach(project => {

      if (filter === "all" || project.dataset.category === filter) {
        project.style.display = "";
      } else {
        project.style.display = "none";
      }

    });

  });
});