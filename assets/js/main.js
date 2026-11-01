/* RJV STUDIOS — shared site interactions */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelectorAll(".nav-links a");
  if (menuToggle) {
    navLinks.forEach(link => link.addEventListener("click", () => {
      menuToggle.checked = false;
    }));
  }
});
