(() => {
  "use strict";

  const demos = document.querySelectorAll("[data-attention-demo]");
  if (!demos.length) return;

  demos.forEach((demo) => {
    const targets = demo.querySelectorAll("[data-attention-target]");
    const toggle = demo.querySelector("[data-attention-toggle]");
    let changeTimer = 0;
    let resetTimer = 0;
    let paused = false;

    const setTargetState = (active) => {
      targets.forEach((target) => target.classList.toggle("is-target", active));
    };

    const scheduleChange = () => {
      window.clearTimeout(changeTimer);
      if (paused || document.hidden) return;

      const delay = 1800 + Math.random() * 2600;
      changeTimer = window.setTimeout(() => {
        setTargetState(true);
        resetTimer = window.setTimeout(() => {
          setTargetState(false);
          scheduleChange();
        }, 550);
      }, delay);
    };

    const setPaused = (nextPaused) => {
      paused = nextPaused;
      window.clearTimeout(changeTimer);
      window.clearTimeout(resetTimer);
      setTargetState(false);
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.textContent = paused ? "Resume color changes" : "Pause color changes";
      if (!paused) scheduleChange();
    };

    toggle.addEventListener("click", () => setPaused(!paused));

    document.addEventListener("visibilitychange", () => {
      window.clearTimeout(changeTimer);
      window.clearTimeout(resetTimer);
      setTargetState(false);
      if (!document.hidden && !paused) scheduleChange();
    });

    scheduleChange();
  });
})();
