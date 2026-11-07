const worldButtons = Array.from(document.querySelectorAll("[data-world]"));
const nameEl = document.querySelector("[data-selected-name]");
const typeEl = document.querySelector("[data-selected-type]");
const summaryEl = document.querySelector("[data-selected-summary]");
const distanceEl = document.querySelector("[data-selected-distance]");
const orbitEl = document.querySelector("[data-selected-orbit]");
const linkEl = document.querySelector("[data-selected-link]");

worldButtons.forEach((button) => button.addEventListener("click", () => {
  worldButtons.forEach((item) => {
    item.classList.remove("selected");
    item.setAttribute("aria-pressed", "false");
  });
  button.classList.add("selected");
  button.setAttribute("aria-pressed", "true");
  if (nameEl) nameEl.textContent = button.dataset.name || "";
  if (typeEl) typeEl.textContent = button.dataset.type || "";
  if (summaryEl) summaryEl.textContent = button.dataset.summary || "";
  if (distanceEl) distanceEl.textContent = button.dataset.distance || "";
  if (orbitEl) orbitEl.textContent = button.dataset.orbit || "";
  if (linkEl) linkEl.href = "/planets/" + button.dataset.world + "/";
}));
