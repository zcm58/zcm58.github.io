(() => {
  "use strict";

  const demos = document.querySelectorAll("[data-attention-demo]");
  if (!demos.length) return;

  demos.forEach((demo) => {
    const targets = demo.querySelectorAll("[data-attention-target]");
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
        setTargetState(true);
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
