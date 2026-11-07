const steps = Array.from(document.querySelectorAll("[data-story-step]"));
    const buttons = Array.from(document.querySelectorAll("[data-migration-step]"));
    const diagram = document.querySelector("#migration-diagram");
    const stageLabel = document.querySelector("#migration-stage-label");
    const caption = document.querySelector("#migration-caption");
    const arrowLayer = document.querySelector("#migration-arrows");
    const particleLayer = document.querySelector("#migration-particles");
    const planetNodes = {
      jupiter: document.querySelector("#migration-jupiter"),
      saturn: document.querySelector("#migration-saturn"),
      uranus: document.querySelector("#migration-uranus"),
      neptune: document.querySelector("#migration-neptune")
    };
    const stages = [
      { label: "Stage 01 · Formation", caption: "A compact young giant-planet system and a remnant outer disk are one possible starting point for migration models.", coords: [[350,245],[372,282],[398,220],[416,300]], radii: [91,124,143,168], particles: 0, arrows: false },
      { label: "Stage 02 · Slow migration", caption: "Repeated gravitational encounters with planetesimals exchange orbital energy and angular momentum, gradually changing planetary orbits.", coords: [[348,235],[388,292],[420,208],[438,314]], radii: [92,132,165,190], particles: 18, arrows: true },
      { label: "Stage 03 · Instability", caption: "In some Nice-model scenarios, resonance crossings and close encounters rapidly reorganise the outer planets. The exact history is model-dependent.", coords: [[340,230],[404,300],[447,195],[466,330]], radii: [83,145,190,220], particles: 34, arrows: true },
      { label: "Stage 04 · Present layout", caption: "A widely spaced giant-planet architecture remains today. The exact migration pathway is inferred by comparing dynamical models with observations.", coords: [[362,238],[405,292],[432,205],[474,320]], radii: [105,145,185,220], particles: 9, arrows: false }
    ];
    function setStage(index) {
      const stage = stages[index];
      if (!stage || !diagram) return;
      const names = ["jupiter", "saturn", "uranus", "neptune"];
      names.forEach((name, i) => {
        const node = planetNodes[name];
        const point = stage.coords[i];
        const orbit = document.querySelector("#migration-" + name + "-orbit");
        if (node) { node.setAttribute("cx", String(point[0])); node.setAttribute("cy", String(point[1])); }
        if (orbit) orbit.setAttribute("r", String(stage.radii[i]));
      });
      if (stageLabel) stageLabel.textContent = stage.label;
      if (caption) caption.textContent = stage.caption;
      if (arrowLayer) arrowLayer.setAttribute("opacity", stage.arrows ? "1" : "0");
      if (particleLayer) {
        particleLayer.replaceChildren();
        for (let i = 0; i < stage.particles; i++) {
          const angle = i * 2.399963229728653;
          const radius = 177 + (i % 5) * 10;
          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("cx", String(260 + Math.cos(angle) * radius));
          dot.setAttribute("cy", String(260 + Math.sin(angle) * radius));
          dot.setAttribute("r", String(1.2 + (i % 3) * .45));
          dot.setAttribute("opacity", String(.3 + (i % 4) * .14));
          particleLayer.append(dot);
        }
      }
      steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
      buttons.forEach((button, i) => {
        if (i === index) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
      diagram.setAttribute("aria-label", stage.label + ". " + stage.caption);
    }
    buttons.forEach((button, index) => button.addEventListener("click", () => setStage(index)));
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setStage(Number(visible.target.dataset.storyStep));
      }, { rootMargin: "-35% 0px -45% 0px", threshold: [0, .25, .5, .75, 1] });
      steps.forEach((step) => observer.observe(step));
    }
    setStage(0);
