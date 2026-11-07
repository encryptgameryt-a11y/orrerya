const glossaryInput = document.querySelector("#glossary-search");
const glossaryItems = Array.from(document.querySelectorAll(".glossary-item"));
const glossaryCount = document.querySelector("#glossary-count");
const glossaryEmpty = document.querySelector("#glossary-empty");

if (glossaryInput) {
  glossaryInput.addEventListener("input", () => {
    const query = glossaryInput.value.trim().toLowerCase();
    let visible = 0;
    glossaryItems.forEach((item) => {
      const matches =
        (item.dataset.term || "").includes(query) ||
        (item.dataset.definition || "").includes(query);
      item.hidden = !matches;
      if (matches) visible += 1;
    });
    if (glossaryCount) glossaryCount.textContent = visible + (visible === 1 ? " term" : " terms");
    if (glossaryEmpty) glossaryEmpty.hidden = visible !== 0;
  });
}
