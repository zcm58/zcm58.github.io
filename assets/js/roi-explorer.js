(function () {
  "use strict";

  var explorer = document.querySelector("[data-roi-explorer]");
  if (!explorer) return;

  var SVG_NS = "http://www.w3.org/2000/svg";
  var electrodes = [
    ["Fp1", 18, -2], ["AF7", 36, -2], ["AF3", 25, 16],
    ["F1", 22, 40], ["F3", 39, 30], ["F5", 49, 15],
    ["F7", 54, -2], ["FT7", 72, -2], ["FC5", 69, 18],
    ["FC3", 62, 40], ["FC1", 45, 58], ["C1", 90, 67],
    ["C3", 90, 44], ["C5", 90, 21], ["T7", 90, -2],
    ["TP7", 108, -2], ["CP5", 111, 18], ["CP3", 118, 40],
    ["CP1", 135, 58], ["P1", 158, 40], ["P3", 141, 30],
    ["P5", 131, 15], ["P7", 126, -2], ["P9", 126, -25],
    ["PO7", 144, -2], ["PO3", 155, 16], ["O1", 162, -2],
    ["Iz", -180, -25], ["Oz", -180, -2], ["POz", -180, 21],
    ["Pz", -180, 44], ["CPz", -180, 67],
    ["Fpz", 0, -2], ["Fp2", -18, -2], ["AF8", -36, -2],
    ["AF4", -25, 16], ["AFz", 0, 21], ["Fz", 0, 44],
    ["F2", -22, 40], ["F4", -39, 30], ["F6", -49, 15],
    ["F8", -54, -2], ["FT8", -72, -2], ["FC6", -69, 18],
    ["FC4", -62, 40], ["FC2", -45, 58], ["FCz", 0, 67],
    ["Cz", -90, 90], ["C2", -90, 67], ["C4", -90, 44],
    ["C6", -90, 21], ["T8", -90, -2], ["TP8", -108, -2],
    ["CP6", -111, 18], ["CP4", -118, 40], ["CP2", -135, 58],
    ["P2", -158, 40], ["P4", -141, 30], ["P6", -131, 15],
    ["P8", -126, -2], ["P10", -126, -25], ["PO8", -144, -2],
    ["PO4", -155, 16], ["O2", -162, -2]
  ];

  var regions = {
    lot: {
      name: "Left occipito-temporal",
      electrodes: ["PO3", "P7", "PO7", "P9", "O1"]
    },
    rot: {
      name: "Right occipito-temporal",
      electrodes: ["PO4", "P8", "PO8", "P10", "O2"]
    },
    central: {
      name: "Central",
      electrodes: ["C1", "Cz", "C2", "CP1", "CPz", "CP2"]
    },
    frontal: {
      name: "Fronto-central",
      electrodes: ["Fz", "FC1", "FC2", "Cz"]
    },
    occipital: {
      name: "Occipital",
      electrodes: ["O1", "Oz", "O2"]
    },
    lpo: {
      name: "Left parieto-occipital",
      electrodes: ["PO7", "P5", "P7"]
    },
    rpo: {
      name: "Right parieto-occipital",
      electrodes: ["PO8", "P6", "P8"]
    }
  };

  var views = {
    core: {
      name: "Common ROI set",
      regions: ["lot", "rot", "central", "frontal"]
    },
    "parieto-occipital": {
      name: "Parieto-occipital view",
      regions: ["lpo", "rpo"]
    },
    occipital: {
      name: "Occipital view",
      regions: ["occipital"]
    }
  };

  validateData();

  var map = explorer.querySelector("[data-roi-map]");
  var mapScroller = explorer.querySelector(".roi-map-scroll");
  var fallback = explorer.querySelector("[data-roi-map-fallback]");
  var status = explorer.querySelector("[data-roi-status]");
  var viewButtons = Array.from(explorer.querySelectorAll("[data-roi-view]"));
  var regionButtons = Array.from(explorer.querySelectorAll("[data-roi-select]"));
  var controlGroups = Array.from(explorer.querySelectorAll("[data-roi-controls]"));
  var detailPanels = Array.from(explorer.querySelectorAll("[data-roi-detail]"));

  if (!map || !mapScroller || !fallback || !status) return;

  var activeView = "core";
  var selectedRegion = "lot";
  var renderedMap = buildMap();
  var svg = renderedMap.svg;
  var mapDescription = renderedMap.description;
  var electrodeNodes = renderedMap.electrodeNodes;

  map.appendChild(svg);
  fallback.hidden = true;

  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setView(button.getAttribute("data-roi-view"));
    });
  });

  regionButtons.forEach(function (button) {
    var regionId = button.getAttribute("data-roi-select");
    var panel = explorer.querySelector('[data-roi-detail="' + regionId + '"]');
    if (panel) {
      panel.id = "roi-detail-" + regionId;
      button.setAttribute("aria-controls", panel.id);
    }

    button.addEventListener("click", function () {
      setRegion(regionId, true);
    });
  });

  map.addEventListener("click", function (event) {
    var electrode = event.target.closest(".roi-electrode");
    if (!electrode || !map.contains(electrode)) return;

    var regionId = electrode.getAttribute("data-region");
    if (regionId) setRegion(regionId, true);
  });

  setView(activeView, false);

  function validateData() {
    var labels = electrodes.map(function (electrode) { return electrode[0]; });
    var uniqueLabels = new Set(labels);

    if (electrodes.length !== 64 || uniqueLabels.size !== 64) {
      throw new Error("The BioSemi map must contain exactly 64 unique electrodes.");
    }

    Object.keys(regions).forEach(function (regionId) {
      var members = regions[regionId].electrodes;
      if (new Set(members).size !== members.length) {
        throw new Error("Duplicate electrode in ROI: " + regionId);
      }

      members.forEach(function (label) {
        if (!uniqueLabels.has(label)) {
          throw new Error("Unknown electrode " + label + " in ROI " + regionId);
        }
      });
    });
  }

  function createSvgElement(name, attributes) {
    var element = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (attribute) {
      element.setAttribute(attribute, attributes[attribute]);
    });
    return element;
  }

  function buildMap() {
    var centerX = 320;
    var centerY = 300;
    var scale = 390;
    var nodes = new Map();
    var svgElement = createSvgElement("svg", {
      class: "roi-scalp-map",
      viewBox: "0 0 640 590",
      role: "img",
      "aria-labelledby": "roi-map-title roi-map-description",
      focusable: "false"
    });

    var title = createSvgElement("title", { id: "roi-map-title" });
    title.textContent = "Top-down BioSemi 64 electrode map";
    svgElement.appendChild(title);

    var description = createSvgElement("desc", { id: "roi-map-description" });
    svgElement.appendChild(description);

    var outline = createSvgElement("g", { class: "roi-head-outline", "aria-hidden": "true" });
    outline.appendChild(createSvgElement("circle", { cx: centerX, cy: centerY, r: 195 }));
    outline.appendChild(createSvgElement("path", { d: "M 289 108 L 320 77 L 351 108" }));
    outline.appendChild(createSvgElement("path", { d: "M 123 262 C 92 267 91 333 123 338" }));
    outline.appendChild(createSvgElement("path", { d: "M 517 262 C 548 267 549 333 517 338" }));
    outline.appendChild(createSvgElement("line", { x1: centerX, y1: 289, x2: centerX, y2: 311 }));
    outline.appendChild(createSvgElement("line", { x1: 309, y1: centerY, x2: 331, y2: centerY }));
    svgElement.appendChild(outline);

    var orientation = createSvgElement("g", { class: "roi-map-orientation", "aria-hidden": "true" });
    [
      ["FRONT", centerX, 35, "middle"],
      ["BACK", centerX, 582, "middle"],
      ["LEFT", 24, centerY + 4, "start"],
      ["RIGHT", 616, centerY + 4, "end"]
    ].forEach(function (item) {
      var label = createSvgElement("text", {
        x: item[1],
        y: item[2],
        "text-anchor": item[3]
      });
      label.textContent = item[0];
      orientation.appendChild(label);
    });
    svgElement.appendChild(orientation);

    var electrodeLayer = createSvgElement("g", { class: "roi-electrode-layer", "aria-hidden": "true" });
    electrodes.forEach(function (electrode) {
      var label = electrode[0];
      var theta = electrode[1];
      var phi = electrode[2];
      var angle = -theta * Math.PI / 180;
      var radius = 0.5 - phi / 180;
      var x = centerX + scale * radius * Math.sin(angle);
      var y = centerY - scale * radius * Math.cos(angle);
      var group = createSvgElement("g", {
        class: "roi-electrode",
        transform: "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ")",
        "data-electrode": label
      });
      var electrodeTitle = createSvgElement("title", {});
      electrodeTitle.textContent = label;
      group.appendChild(electrodeTitle);
      group.appendChild(createSvgElement("circle", { r: 13 }));
      var text = createSvgElement("text", { y: "0.5", "text-anchor": "middle" });
      text.textContent = label;
      group.appendChild(text);
      electrodeLayer.appendChild(group);
      nodes.set(label, { group: group, title: electrodeTitle, x: x });
    });
    svgElement.appendChild(electrodeLayer);

    return {
      svg: svgElement,
      description: description,
      electrodeNodes: nodes
    };
  }

  function setView(viewId, announce) {
    if (!views[viewId]) return;

    activeView = viewId;
    if (views[viewId].regions.indexOf(selectedRegion) === -1) {
      selectedRegion = views[viewId].regions[0];
    }

    viewButtons.forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-roi-view") === activeView)
      );
    });

    controlGroups.forEach(function (group) {
      group.hidden = group.getAttribute("data-roi-controls") !== activeView;
    });

    setRegion(selectedRegion, false);
    if (announce !== false) updateStatus();
  }

  function setRegion(regionId, announce) {
    if (!regions[regionId] || views[activeView].regions.indexOf(regionId) === -1) return;

    selectedRegion = regionId;
    regionButtons.forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-roi-select") === selectedRegion)
      );
    });

    detailPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-roi-detail") !== selectedRegion;
    });

    updateMap();
    if (announce !== false) updateStatus();
  }

  function updateMap() {
    var visibleRegions = views[activeView].regions;
    var memberships = new Map();

    visibleRegions.forEach(function (regionId) {
      regions[regionId].electrodes.forEach(function (label) {
        var electrodeRegions = memberships.get(label) || [];
        electrodeRegions.push(regionId);
        memberships.set(label, electrodeRegions);
      });
    });

    electrodeNodes.forEach(function (node, label) {
      var electrodeRegions = memberships.get(label) || [];
      var regionId = electrodeRegions.indexOf(selectedRegion) !== -1
        ? selectedRegion
        : electrodeRegions[0] || "";
      node.group.setAttribute("data-region", regionId);
      node.group.setAttribute("data-selected", String(regionId === selectedRegion));
      node.title.textContent = electrodeRegions.length
        ? label + "; included in " + electrodeRegions.map(function (id) {
          return regions[id].name;
        }).join(" and ") + (electrodeRegions.length > 1 ? " ROIs" : " ROI")
        : label + "; not included in this map view";
    });

    var selected = regions[selectedRegion];
    mapDescription.textContent = "Nose-up map of all 64 scalp electrodes. " +
      views[activeView].name + " is shown. " + selected.name + " is selected at " +
      selected.electrodes.join(", ") + ".";

    centerSelectedRegion(selected);
  }

  function centerSelectedRegion(region) {
    if (mapScroller.scrollWidth <= mapScroller.clientWidth) return;

    var meanX = region.electrodes.reduce(function (sum, label) {
      return sum + electrodeNodes.get(label).x;
    }, 0) / region.electrodes.length;
    var renderedMapWidth = svg.getBoundingClientRect().width;
    var target = meanX / 640 * renderedMapWidth - mapScroller.clientWidth / 2;
    var maximum = mapScroller.scrollWidth - mapScroller.clientWidth;
    mapScroller.scrollLeft = Math.max(0, Math.min(maximum, target));
  }

  function updateStatus() {
    var selected = regions[selectedRegion];
    status.textContent = views[activeView].name + " shown. " + selected.name +
      " ROI selected: " + selected.electrodes.join(", ") + ".";
  }
}());
