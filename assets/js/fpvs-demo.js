(() => {
  "use strict";

  const demo = document.querySelector("[data-fpvs-demo]");
  if (!demo) return;

  const stimulus = demo.querySelector("[data-demo-stimulus]");
  const fixation = demo.querySelector("[data-demo-fixation]");
  const stage = demo.querySelector("[data-demo-stage]");
  const curtain = demo.querySelector("[data-demo-curtain]");
  const curtainText = demo.querySelector("[data-demo-curtain-text]");
  const startButton = demo.querySelector("[data-demo-start]");
  const stopButton = demo.querySelector("[data-demo-stop]");
  const responseButton = demo.querySelector("[data-demo-response]");
  const timer = demo.querySelector("[data-demo-timer]");
  const status = demo.querySelector("[data-demo-status]");

  const baseImages = [
    "../assets/fpvs-demo/green-vegetable-01.png",
    "../assets/fpvs-demo/green-vegetable-02.png",
    "../assets/fpvs-demo/green-vegetable-03.png",
    "../assets/fpvs-demo/green-vegetable-04.png",
  ];
  const oddballImages = [
    "../assets/fpvs-demo/red-vegetable-01.png",
    "../assets/fpvs-demo/red-vegetable-02.png",
  ];

  const stimulusRate = 6;
  const oddballInterval = 5;
  const periodMs = 1000 / stimulusRate;
  const imageOnMs = periodMs / 2;
  const durationMs = 30000;
  const totalCycles = durationMs / (periodMs * oddballInterval);

  let animationFrame = 0;
  let startTime = 0;
  let running = false;
  let currentStimulusIndex = -1;
  let baseSequence = [];
  let oddballSequence = [];
  let colorChangeCycles = new Set();
  let respondedCycles = new Set();
  let hits = 0;
  let falseAlarms = 0;

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const replacement = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[replacement]] = [
        shuffled[replacement],
        shuffled[index],
      ];
    }
    return shuffled;
  }

  function selectColorChangeCycles() {
    const first = 7 + Math.floor(Math.random() * 7);
    const second = 23 + Math.floor(Math.random() * 8);
    return new Set([first, second]);
  }

  function setControls(isRunning) {
    startButton.disabled = isRunning;
    stopButton.disabled = !isRunning;
    responseButton.disabled = !isRunning;
  }

  function setIdleStage(message) {
    stimulus.classList.remove("is-visible");
    fixation.classList.remove("is-target");
    stage.removeAttribute("data-stimulus-index");
    stage.removeAttribute("data-stimulus-kind");
    curtainText.textContent = message;
    curtain.hidden = false;
  }

  function finishDemo() {
    running = false;
    cancelAnimationFrame(animationFrame);
    timer.textContent = "0.0 s";
    setControls(false);
    startButton.textContent = "Run again";
    setIdleStage("Demonstration complete.");

    const colorChangeSummary = `${hits} of ${colorChangeCycles.size} color changes detected`;
    const falseAlarmSummary = falseAlarms === 1
      ? "1 response while the cross was blue"
      : `${falseAlarms} responses while the cross was blue`;
    status.textContent = `${colorChangeSummary}; ${falseAlarmSummary}.`;
  }

  function stopDemo(message = "Demonstration stopped. Select start to begin again.") {
    if (!running) return;
    running = false;
    cancelAnimationFrame(animationFrame);
    setControls(false);
    startButton.textContent = "Restart 30-second demo";
    timer.textContent = "30.0 s";
    setIdleStage("Demonstration stopped.");
    status.textContent = message;
  }

  function recordResponse() {
    if (!running) return;

    const elapsed = performance.now() - startTime;
    const stimulusIndex = Math.min(
      Math.floor(elapsed / periodMs),
      stimulusRate * (durationMs / 1000) - 1,
    );
    const cycleIndex = Math.floor(stimulusIndex / oddballInterval);

    if (colorChangeCycles.has(cycleIndex) && !respondedCycles.has(cycleIndex)) {
      hits += 1;
      respondedCycles.add(cycleIndex);
      status.textContent = "Color change detected.";
      return;
    }

    falseAlarms += 1;
    status.textContent = "The cross is currently blue. Keep watching for red.";
  }

  function updateStimulus(stimulusIndex) {
    const isOddball = (stimulusIndex + 1) % oddballInterval === 0;
    stage.setAttribute("data-stimulus-index", String(stimulusIndex));
    stage.setAttribute("data-stimulus-kind", isOddball ? "oddball" : "base");
    if (isOddball) {
      const oddballIndex = Math.floor(stimulusIndex / oddballInterval);
      stimulus.src = oddballSequence[oddballIndex % oddballSequence.length];
      return;
    }

    const baseIndex = stimulusIndex - Math.floor(stimulusIndex / oddballInterval);
    stimulus.src = baseSequence[baseIndex % baseSequence.length];
  }

  function renderFrame(now) {
    if (!running) return;

    const elapsed = now - startTime;
    if (elapsed >= durationMs) {
      finishDemo();
      return;
    }

    const stimulusIndex = Math.floor(elapsed / periodMs);
    const phase = elapsed - stimulusIndex * periodMs;
    const cycleIndex = Math.floor(stimulusIndex / oddballInterval);

    if (stimulusIndex !== currentStimulusIndex) {
      currentStimulusIndex = stimulusIndex;
      updateStimulus(stimulusIndex);
    }

    stimulus.classList.toggle("is-visible", phase < imageOnMs);
    fixation.classList.toggle("is-target", colorChangeCycles.has(cycleIndex));
    timer.textContent = `${Math.max(0, (durationMs - elapsed) / 1000).toFixed(1)} s`;
    animationFrame = requestAnimationFrame(renderFrame);
  }

  function startDemo() {
    baseSequence = shuffle(baseImages);
    oddballSequence = shuffle(oddballImages);
    colorChangeCycles = selectColorChangeCycles();
    respondedCycles = new Set();
    hits = 0;
    falseAlarms = 0;
    currentStimulusIndex = -1;
    timer.textContent = "30.0 s";
    status.textContent = "Running. Press Space or select “I saw red” when the cross turns red.";
    curtain.hidden = true;
    setControls(true);
    running = true;
    startTime = performance.now();
    stage.focus({ preventScroll: true });
    animationFrame = requestAnimationFrame(renderFrame);
  }

  function preloadImages() {
    const sources = [...baseImages, ...oddballImages];
    return Promise.all(sources.map((source) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = reject;
      image.src = source;
    })));
  }

  startButton.addEventListener("click", startDemo);
  stopButton.addEventListener("click", () => stopDemo());
  responseButton.addEventListener("click", recordResponse);

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat || !running) return;
    event.preventDefault();
    recordResponse();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) {
      stopDemo("Demonstration stopped because this tab became inactive. Restart when ready.");
    }
  });

  preloadImages()
    .then(() => {
      startButton.disabled = false;
      startButton.textContent = "Start 30-second demo";
      status.textContent = "Images ready. Start when you are comfortable viewing rapid visual changes.";
    })
    .catch(() => {
      startButton.disabled = true;
      startButton.textContent = "Images unavailable";
      status.textContent = "The demonstration images could not be loaded.";
    });

  if (!Number.isInteger(totalCycles)) {
    throw new Error("FPVS demo duration must contain a whole number of oddball cycles.");
  }
})();
