const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#primary-nav");

if (toggle && nav) {
  const closeNavigation = (returnFocus = false) => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      closeNavigation();
    } else {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation");
      nav.classList.add("is-open");
    }
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeNavigation());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeNavigation(true);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    const target = event.target;
    if (target instanceof Node && !toggle.contains(target) && !nav.contains(target)) {
      closeNavigation();
    }
  });
}
