import {
      ASTRONOMICAL_UNIT_KM,
      SPEED_OF_LIGHT_KM_S,
      EARTH_SIDEREAL_YEAR_DAYS
    } from "../../lib/scientific-constants.js";
    const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
    function pulseResult(target) {
      if (!target) return;
      target.classList.remove("result-updated");
      void target.offsetWidth;
      target.classList.add("result-updated");
    }
    const massInput = document.querySelector<HTMLInputElement>("#mass-input");
    const gravitySelect = document.querySelector<HTMLSelectElement>("#gravity-world");
    const weightResult = document.querySelector<HTMLElement>("#weight-result");
    const weightSub = document.querySelector<HTMLElement>("#weight-subresult");
    const weightBox = weightResult?.closest(".result-box") as HTMLElement | null;
    function updateWeight(animate = false) {
      if (!massInput || !gravitySelect || !weightResult || !weightSub) return;
      const mass = Number(massInput.value);
      const gravity = Number(gravitySelect.value);
      if (!Number.isFinite(mass) || mass < 0 || !Number.isFinite(gravity)) {
        weightResult.textContent = "Enter a valid mass";
        weightSub.textContent = "Use a non-negative number in kilograms.";
        return;
      }
      const force = mass * gravity;
      weightResult.textContent = formatter.format(force) + " N";
      weightSub.textContent = "About " + formatter.format(force / 9.80665) + " kg-force on an Earth-calibrated scale · " + (gravitySelect.selectedOptions[0]?.dataset.name || "selected world");
      if (animate) pulseResult(weightBox);
    }
    massInput?.addEventListener("input", () => updateWeight(true));
    gravitySelect?.addEventListener("change", () => updateWeight(true));
    updateWeight();

    const auInput = document.querySelector<HTMLInputElement>("#au-input");
    const kmResult = document.querySelector<HTMLElement>("#km-result");
    const lightResult = document.querySelector<HTMLElement>("#light-result");
    const distanceBox = kmResult?.closest(".result-box") as HTMLElement | null;
    function updateDistance(animate = false) {
      if (!auInput || !kmResult || !lightResult) return;
      const au = Number(auInput.value);
      if (!Number.isFinite(au) || au < 0) {
        kmResult.textContent = "Enter a valid distance";
        lightResult.textContent = "Use a non-negative number of AU.";
        return;
      }
      const km = au * ASTRONOMICAL_UNIT_KM;
      const seconds = km / SPEED_OF_LIGHT_KM_S;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remain = Math.round(seconds % 60);
      kmResult.textContent = formatter.format(km) + " km";
      lightResult.textContent = hours > 0 ? "Light travel time: " + hours + " h " + minutes + " min " + remain + " s" : "Light travel time: " + minutes + " min " + remain + " s";
      if (animate) pulseResult(distanceBox);
    }
    auInput?.addEventListener("input", () => updateDistance(true));
    updateDistance();

    const sizeSelect = document.querySelector<HTMLSelectElement>("#size-world");
    const sizeOrb = document.querySelector<HTMLElement>("#size-orb");
    const sizeName = document.querySelector<HTMLElement>("#size-name");
    const sizeDiameter = document.querySelector<HTMLElement>("#size-diameter");
    const sizeRatio = document.querySelector<HTMLElement>("#size-ratio");
    const massRatio = document.querySelector<HTMLElement>("#mass-ratio");
    const scaleFill = document.querySelector<HTMLElement>("#scale-fill");
    const sizeStage = sizeOrb?.closest(".size-stage") as HTMLElement | null;
    function updateSize(animate = false) {
      if (!sizeSelect || !sizeOrb || !sizeName || !sizeDiameter || !sizeRatio || !massRatio || !scaleFill) return;
      const diameter = Number(sizeSelect.value);
      const mass = Number(sizeSelect.selectedOptions[0]?.dataset.mass);
      const ratio = diameter / 12756;
      const massMultiple = mass / 5.97217;
      const visualSize = Math.max(13, Math.min(188, 56 * ratio));
      sizeOrb.style.width = visualSize + "px";
      sizeOrb.style.height = visualSize + "px";
      sizeName.textContent = sizeSelect.selectedOptions[0]?.dataset.name || "Selected world";
      sizeDiameter.textContent = formatter.format(diameter) + " km diameter";
      sizeRatio.textContent = formatter.format(ratio) + " × Earth's diameter";
      massRatio.textContent = formatter.format(massMultiple) + " × Earth's mass";
      scaleFill.style.width = Math.min(100, (diameter / 142984) * 100) + "%";
      if (animate) pulseResult(sizeStage);
    }
    sizeSelect?.addEventListener("change", () => updateSize(true));
    updateSize();

    const yearSelect = document.querySelector<HTMLSelectElement>("#year-world");
    const yearResult = document.querySelector<HTMLElement>("#year-result");
    const yearSub = document.querySelector<HTMLElement>("#year-subresult");
    const yearBox = yearResult?.closest(".result-box") as HTMLElement | null;
    function updateYear(animate = false) {
      if (!yearSelect || !yearResult || !yearSub) return;
      const days = Number(yearSelect.value);
      yearResult.textContent = formatter.format(days) + " days";
      yearSub.textContent = "About " + formatter.format(days / EARTH_SIDEREAL_YEAR_DAYS) + " Earth years · " + (yearSelect.selectedOptions[0]?.dataset.name || "selected world");
      if (animate) pulseResult(yearBox);
    }
    yearSelect?.addEventListener("change", () => updateYear(true));
    updateYear();
    const calculatorDialogs = Array.from(document.querySelectorAll(".tool-dialog"));
    let activeCalculator = null;
    let calculatorReturnFocus = null;
    function closeCalculator(dialog, updateHistory = true) {
      if (!dialog || dialog.hidden) return;
      const wasActive = activeCalculator === dialog;
      dialog.hidden = true;
      dialog.classList.remove("is-open");
      dialog.setAttribute("aria-hidden", "true");
      if (wasActive) activeCalculator = null;
      if (updateHistory && location.hash === "#" + dialog.id) {
        if (history.state && history.state.orreryaCalculator === dialog.id) history.back();
        else history.replaceState(history.state, "", location.pathname + location.search);
      }
      if (wasActive && calculatorReturnFocus && calculatorReturnFocus.focus) calculatorReturnFocus.focus();
    }
    function openCalculator(id, addHistory = true) {
      const dialog = calculatorDialogs.find((item) => item.id === id);
      if (!dialog) return;
      calculatorDialogs.forEach((item) => { if (item !== dialog && !item.hidden) closeCalculator(item, false); });
      if (dialog.hidden) {
        calculatorReturnFocus = document.activeElement;
        dialog.hidden = false;
        dialog.classList.add("is-open");
        dialog.setAttribute("aria-hidden", "false");
      }
      activeCalculator = dialog;
      if (addHistory && location.hash !== "#" + id) history.pushState({ orreryaCalculator: id }, "", location.pathname + location.search + "#" + id);
      const focusTarget = dialog.querySelector('input:not([type="hidden"]), select, button');
      if (focusTarget) requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
    }
    document.querySelectorAll("[data-open-tool]").forEach((button) => {
      button.addEventListener("click", () => openCalculator(button.dataset.openTool || ""));
    });
    calculatorDialogs.forEach((dialog) => {
      dialog.querySelector("[data-close-tool]")?.addEventListener("click", () => closeCalculator(dialog));
      dialog.addEventListener("click", (event) => { if (event.target === dialog) closeCalculator(dialog); });
    });
    document.addEventListener("keydown", (event) => {
      if (!activeCalculator) return;
      if (event.key === "Escape") { event.preventDefault(); closeCalculator(activeCalculator); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(activeCalculator.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    function syncCalculatorFromUrl() {
      const id = decodeURIComponent(location.hash.slice(1));
      calculatorDialogs.forEach((dialog) => { if (dialog.id !== id && !dialog.hidden) closeCalculator(dialog, false); });
      if (id && calculatorDialogs.some((dialog) => dialog.id === id)) openCalculator(id, false);
    }
    window.addEventListener("popstate", syncCalculatorFromUrl);
    syncCalculatorFromUrl();
