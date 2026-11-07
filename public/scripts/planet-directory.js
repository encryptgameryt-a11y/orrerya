const input = document.querySelector("#planet-search");
const cards = Array.from(document.querySelectorAll(".directory-card"));
const count = document.querySelector("#planet-count");

if (input) {
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matches =
        (card.dataset.planet || "").includes(query) ||
        (card.dataset.type || "").includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    if (count) count.textContent = visible + (visible === 1 ? " world" : " worlds");
  });
}
