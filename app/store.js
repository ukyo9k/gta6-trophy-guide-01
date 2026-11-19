/* Progress store: earned trophies saved in localStorage, with export/import.
   Nothing leaves the browser except a file the player downloads. */

export const STORAGE_KEY = "gta6-trophy-guide-v1";
export const SETTINGS_KEY = "gta6-trophy-guide-settings-v1";

/** Load the saved set of earned trophy ids (numbers). */
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

/** Persist the set of earned trophy ids. */
export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
    return true;
  } catch {
    return false;
  }
}

/** Load saved settings (spoiler mode, theme). */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Persist settings. */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

/** Build the export document for a download: earned ids plus a header. */
export function buildExportDoc(earned, total) {
  return {
    app: "Leonida Trophy Guide — GTA VI",
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    total,
  };
}

/** Parse an imported file's text into a set of earned ids. Throws on bad input. */
export function parseImportDoc(text, validIds) {
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error("File does not hold a list of trophy ids.");
  const valid = new Set(validIds);
  const earned = new Set();
  for (const n of ids) {
    const id = Number(n);
    if (Number.isInteger(id) && valid.has(id)) earned.add(id);
  }
  return earned;
}

/** Trigger a download of the export document as a JSON file. */
export function downloadExport(doc) {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gta6-trophy-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
