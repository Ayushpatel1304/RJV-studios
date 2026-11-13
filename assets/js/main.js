/* RJV STUDIOS — shared site interactions */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("site-navigation");
  if (menuToggle && navigation) {
    const setMenuOpen = open => {
      menuToggle.setAttribute("aria-expanded", String(open));
      navigation.classList.toggle("is-open", open);
    };
    menuToggle.addEventListener("click", () => {
      setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
    window.matchMedia("(max-width: 720px)").addEventListener("change", () => setMenuOpen(false));
  }

  // Keep phone numbers to digits and commonly used international phone characters.
  const phoneInput = document.getElementById("enquiry-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      let value = phoneInput.value.replace(/[^0-9+() -]/g, "");
      if (value.startsWith("+")) {
        value = "+" + value.slice(1).replace(/\+/g, "");
      } else {
        value = value.replace(/\+/g, "");
      }
      phoneInput.value = value;
    });
  }

  // Format preferred dates as DD/MM/YYYY and reject invalid or non-future dates.
  const dateInput = document.getElementById("enquiry-date");
  if (dateInput) {
    const validateDate = () => {
      const value = dateInput.value;
      dateInput.setCustomValidity("");
      if (!value) return;

      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        dateInput.setCustomValidity("Enter the date in DD/MM/YYYY format.");
        return;
      }

      const [day, month, year] = value.split("/").map(Number);
      const selected = new Date(year, month - 1, day);
      const isRealDate = selected.getFullYear() === year &&
        selected.getMonth() === month - 1 &&
        selected.getDate() === day;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!isRealDate) {
        dateInput.setCustomValidity("Enter a valid calendar date.");
      } else if (selected <= today) {
        dateInput.setCustomValidity("Preferred date must be in the future.");
      }
    };

    dateInput.addEventListener("input", () => {
      const digits = dateInput.value.replace(/\D/g, "").slice(0, 8);
      let formatted = digits.slice(0, 2);
      if (digits.length > 2) formatted += "/" + digits.slice(2, 4);
      if (digits.length > 4) formatted += "/" + digits.slice(4, 8);
      dateInput.value = formatted;
      validateDate();
    });
    dateInput.addEventListener("blur", validateDate);
  }
});
