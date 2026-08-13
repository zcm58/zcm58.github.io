(() => {
  "use strict";

  const demos = document.querySelectorAll("[data-attention-demo]");
  if (!demos.length) return;

  demos.forEach((demo) => {
    const targets = demo.querySelectorAll("[data-attention-target]");
    const usesIndependentBars = demo.dataset.attentionMode === "independent-bars";
    let changeTimer = 0;
    let resetTimer = 0;

    const setTargetState = (active) => {
      targets.forEach((target) => target.classList.toggle("is-target", active));
    };

    const scheduleChange = () => {
      window.clearTimeout(changeTimer);
      if (document.hidden) return;

      const delay = 1300 + Math.random() * 1900;
      changeTimer = window.setTimeout(() => {
        if (usesIndependentBars) {
          const pattern = Math.floor(Math.random() * 3);
          targets.forEach((target, index) => {
            target.classList.toggle("is-target", pattern === 2 || pattern === index);
          });
        } else {
          setTargetState(true);
        }
        resetTimer = window.setTimeout(() => {
          setTargetState(false);
          scheduleChange();
        }, 450);
      }, delay);
    };

    document.addEventListener("visibilitychange", () => {
      window.clearTimeout(changeTimer);
      window.clearTimeout(resetTimer);
      setTargetState(false);
      if (!document.hidden) scheduleChange();
    });

    scheduleChange();
  });
})();
