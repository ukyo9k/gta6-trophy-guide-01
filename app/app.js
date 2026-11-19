/* Boot and wiring: load the trophy data, wire the filters, tabs, spoiler
   setting, theme, and the save/export/import actions. */

import {
  loadEarned,
  saveEarned,
  loadSettings,
  saveSettings,
  buildExportDoc,
  parseImportDoc,
  downloadExport,
  STORAGE_KEY,
} from "./store.js";
import { trophyRow, renderDetail, renderRoadmap, GRADE_ORDER } from "./views.js";

const DATA_URL = "data/trophies.json";
const SEED_IDS = [2, 3, 4, 8, 15, 16, 20, 21, 28, 35, 42, 44, 46];

const $ = (id) => document.getElementById(id);
const els = {
  earnedCount: $("earnedCount"),
  gradeCounts: $("gradeCounts"),
  progressBar: $("progressBar"),
  progressFill: $("progressFill"),
  searchBox: $("searchBox"),
  gradeFilter: $("gradeFilter"),
  statusFilter: $("statusFilter"),
  trophyList: $("trophyList"),
  missableList: $("missableList"),
  emptyNote: $("emptyNote"),
  shownCount: $("shownCount"),
  spoilerNote: $("spoilerNote"),
  spoilerToggle: $("spoilerToggle"),
  themeToggle: $("themeToggle"),
  detailEmpty: $("detailEmpty"),
  detailBody: $("detailBody"),
  roadmapStages: $("roadmapStages"),
  missableCount: $("missableCount"),
  exportBtn: $("exportBtn"),
  importFile: $("importFile"),
  resetBtn: $("resetBtn"),
  saveStatus: $("saveStatus"),
  trackerPanel: $("trackerPanel"),
  roadmapPanel: $("roadmapPanel"),
  missablesPanel: $("missablesPanel"),
};

let trophies = [];
let earned = loadEarned();
let settings = loadSettings();
let spoilersOn = settings.spoilers === true;
let theme = settings.theme === "night" ? "night" : "paper";
let kindFilter = "all";
let selectedId = null;
let currentView = "tracker";

/** Apply the theme to the document and the toggle button. */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", theme);
  els.themeToggle.textContent = theme === "night" ? "Paper theme" : "Night theme";
  els.themeToggle.setAttribute("aria-pressed", theme === "night" ? "true" : "false");
}

/** Persist settings and reflect the spoiler toggle. */
function applySpoilers() {
  els.spoilerToggle.checked = spoilersOn;
  els.spoilerNote.textContent = spoilersOn
    ? "Spoiler setting on: unrevealed story trophies are hidden until earned."
    : "";
}

/** Trophies matching the current filters and search. */
function filteredTrophies() {
  const query = els.searchBox.value.trim().toLowerCase();
  const grade = els.gradeFilter.value;
  const status = els.statusFilter.value;
  return trophies.filter((t) => {
    if (kindFilter === "missable" && !t.missable) return false;
    if (kindFilter !== "all" && kindFilter !== "missable" && t.kind !== kindFilter) return false;
    if (grade !== "all" && t.grade !== grade) return false;
    if (status === "earned" && !earned.has(t.id)) return false;
    if (status === "remaining" && earned.has(t.id)) return false;
    if (query) {
      const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

/** Re-render the checklist and the counters. */
function renderAll() {
  const shown = filteredTrophies();
  els.trophyList.innerHTML = "";
  for (const t of shown) {
    els.trophyList.appendChild(trophyRow(t, earned, spoilersOn, selectedId, toggleEarned, selectTrophy));
  }
  els.emptyNote.hidden = shown.length !== 0;
  els.shownCount.textContent = "Showing " + shown.length + " of " + trophies.length + " trophies.";

  const missables = trophies.filter((t) => t.missable);
  els.missableList.innerHTML = "";
  for (const t of missables) {
    els.missableList.appendChild(trophyRow(t, earned, spoilersOn, selectedId, toggleEarned, selectTrophy));
  }
  els.missableCount.textContent = missables.length + " flagged";

  els.earnedCount.textContent = String(earned.size);
  els.progressFill.style.width = (100 * earned.size / trophies.length) + "%";
  els.progressBar.setAttribute("aria-valuenow", String(earned.size));
  const parts = GRADE_ORDER.map((g) => {
    const total = trophies.filter((t) => t.grade === g).length;
    const done = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return g + " " + done + "/" + total;
  });
  els.gradeCounts.textContent = parts.join(" · ");
  renderRoadmap(els.roadmapStages, trophies, earned, (id) => {
    showView("tracker");
    selectTrophy(id);
  });
}

/** Toggle one trophy's earned state and save. */
function toggleEarned(id, isEarned) {
  if (isEarned) earned.add(id);
  else earned.delete(id);
  saveEarned(earned);
  renderAll();
  renderDetailPane();
}

/** Select a trophy and show its guide in the detail pane. */
function selectTrophy(id) {
  selectedId = id;
  renderAll();
  renderDetailPane();
  els.detailBody.scrollIntoView({ block: "nearest" });
}

/** Render (or clear) the detail pane for the selected trophy. */
function renderDetailPane() {
  const trophy = trophies.find((t) => t.id === selectedId);
  if (!trophy) {
    els.detailEmpty.hidden = false;
    els.detailBody.hidden = true;
    return;
  }
  els.detailEmpty.hidden = true;
  renderDetail(els.detailBody, trophy, earned, spoilersOn, toggleEarned);
}

/** Switch between the Tracker, Roadmap and Missables tabs. */
function showView(view) {
  currentView = view;
  els.trackerPanel.hidden = view !== "tracker";
  els.roadmapPanel.hidden = view !== "roadmap";
  els.missablesPanel.hidden = view !== "missables";
  for (const tab of document.querySelectorAll(".tab")) {
    tab.classList.toggle("active", tab.dataset.view === view);
  }
}

/** Read the deep-link parameters (?seed, ?view, ?spoilers, ?trophy). */
function readDeepLinks() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("seed") === "13" && earned.size === 0) {
    earned = new Set(SEED_IDS);
    saveEarned(earned);
  }
  if (params.get("spoilers") === "on") spoilersOn = true;
  const view = params.get("view");
  if (view === "roadmap" || view === "missables") showView(view);
  const trophy = Number(params.get("trophy"));
  if (Number.isInteger(trophy) && trophies.some((t) => t.id === trophy)) {
    selectedId = trophy;
  }
}

/** Wire every control on the page. */
function wireControls() {
  for (const chip of document.querySelectorAll(".chip")) {
    chip.addEventListener("click", () => {
      kindFilter = chip.dataset.kind;
      for (const c of document.querySelectorAll(".chip")) {
        c.classList.toggle("active", c === chip);
      }
      renderAll();
    });
  }
  els.searchBox.addEventListener("input", renderAll);
  els.gradeFilter.addEventListener("change", renderAll);
  els.statusFilter.addEventListener("change", renderAll);
  for (const tab of document.querySelectorAll(".tab")) {
    tab.addEventListener("click", () => showView(tab.dataset.view));
  }
  els.spoilerToggle.addEventListener("change", () => {
    spoilersOn = els.spoilerToggle.checked;
    settings.spoilers = spoilersOn;
    saveSettings(settings);
    applySpoilers();
    renderAll();
    renderDetailPane();
  });
  els.themeToggle.addEventListener("click", () => {
    theme = theme === "night" ? "paper" : "night";
    settings.theme = theme;
    saveSettings(settings);
    applyTheme();
  });
  els.exportBtn.addEventListener("click", () => {
    downloadExport(buildExportDoc(earned, trophies.length));
    els.saveStatus.textContent = "Progress exported.";
  });
  document.querySelector(".btn-import").addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", async () => {
    const file = els.importFile.files && els.importFile.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      earned = parseImportDoc(text, trophies.map((t) => t.id));
      saveEarned(earned);
      renderAll();
      renderDetailPane();
      els.saveStatus.textContent = "Progress imported: " + earned.size + " earned.";
    } catch (error) {
      els.saveStatus.textContent = "Import failed: " + error.message;
    }
    els.importFile.value = "";
  });
  els.resetBtn.addEventListener("click", () => {
    if (window.confirm("Clear all earned trophies? This cannot be undone.")) {
      earned = new Set();
      saveEarned(earned);
      renderAll();
      renderDetailPane();
      els.saveStatus.textContent = "Progress cleared.";
    }
  });
}

/** Load the data and start the app. */
async function main() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error("Could not load " + DATA_URL);
  const data = await response.json();
  trophies = data.trophies;
  applyTheme();
  wireControls();
  readDeepLinks();
  applySpoilers();
  renderAll();
  renderDetailPane();
}

main().catch((error) => {
  els.trophyList.innerHTML = "";
  const li = document.createElement("li");
  li.textContent = "Could not load the trophy list: " + error.message;
  els.trophyList.appendChild(li);
});
