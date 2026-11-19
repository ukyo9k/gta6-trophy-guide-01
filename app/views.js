/* Rendering: the checklist rows, the detail pane, the roadmap and the
   missables list. All text comes from app/data/trophies.json. */

export const KIND_LABELS = {
  story: "Story",
  missable: "Missable",
  collectible: "Collectible",
  activity: "Activity",
};

export const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: "Stage 1 — Play the story",
    text: "Chapters 1–4, the opening mission, the named story missions and the finale. Story trophies come in order as you play; nothing here needs a detour.",
  },
  {
    stage: 2,
    title: "Stage 2 — Friends, strangers & partners",
    text: "The character-final missions (Andy, Kenton, Billy, Randy, Tyrone), the 8 stranger strands, the partner trophies and Bret's hunt. Do these while the story is still open — most of them are missable.",
  },
  {
    stage: 3,
    title: "Stage 3 — Leonida, explored",
    text: "Collectibles and the open world: cards, WAiNK spots, meditation spots, all 52 areas, the 100 vehicles, the 8 garages and the Scooter Bros registrations. Best done on road trips across the map.",
  },
  {
    stage: 4,
    title: "Stage 4 — Mastery & mop-up",
    text: "The skill and grind trophies: 250 stunts, gold at all 42 Shooting Range challenges, 20 race wins, 14 drone-race wins, the 5 bank vaults, 50 challenges and 100% completion — then the platinum pops.",
  },
];

/** A trophy is hidden by the spoiler rule when it is a story trophy not yet earned. */
export function isSpoilerHidden(trophy, earned, spoilersOn) {
  return spoilersOn && trophy.kind === "story" && !earned.has(trophy.id);
}

/** Format a PSN progress count for display (250000 -> $250,000). */
export function formatCount(trophy) {
  if (trophy.psnCount == null) return "";
  const n = trophy.psnCount;
  if (trophy.id === 52 || trophy.id === 53) return "$" + n.toLocaleString("en-US");
  return String(n);
}

/** Build one checklist row for a trophy. */
export function trophyRow(trophy, earned, spoilersOn, selectedId, onToggle, onSelect) {
  const li = document.createElement("li");
  const hidden = isSpoilerHidden(trophy, earned, spoilersOn);
  const isEarned = earned.has(trophy.id);

  const row = document.createElement("div");
  row.className = "trophy-row" + (isEarned ? " earned" : "") + (selectedId === trophy.id ? " selected" : "") + (hidden ? " spoiler-hidden" : "");
  row.setAttribute("role", "button");
  row.tabIndex = 0;

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = isEarned;
  check.setAttribute("aria-label", "Mark " + trophy.name + " as earned");
  check.addEventListener("click", (event) => {
    event.stopPropagation();
    onToggle(trophy.id, check.checked);
  });
  row.appendChild(check);

  const main = document.createElement("div");
  main.className = "trophy-main";
  const name = document.createElement("div");
  name.className = "trophy-name";
  name.textContent = hidden ? "Hidden story trophy" : trophy.name;
  main.appendChild(name);
  const desc = document.createElement("div");
  desc.className = "trophy-desc";
  desc.textContent = hidden
    ? "Earn this story trophy to reveal its name and description."
    : trophy.description;
  main.appendChild(desc);
  if (hidden) {
    const label = document.createElement("div");
    label.className = "spoiler-label";
    label.textContent = "Spoilers hidden — earn it to reveal";
    main.appendChild(label);
  }
  const meta = document.createElement("div");
  meta.className = "trophy-meta";
  const grade = document.createElement("span");
  grade.className = "grade-badge " + trophy.grade;
  grade.textContent = trophy.grade;
  meta.appendChild(grade);
  const kind = document.createElement("span");
  kind.className = "tag";
  kind.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  meta.appendChild(kind);
  if (trophy.missable) {
    const miss = document.createElement("span");
    miss.className = "tag missable";
    miss.textContent = "Missable";
    meta.appendChild(miss);
  }
  if (trophy.psnCount != null) {
    const count = document.createElement("span");
    count.className = "tag count";
    count.textContent = "PSN count: " + formatCount(trophy);
    meta.appendChild(count);
  }
  main.appendChild(meta);
  row.appendChild(main);

  const open = document.createElement("span");
  open.className = "tag";
  open.textContent = "Guide ›";
  row.appendChild(open);

  row.addEventListener("click", () => onSelect(trophy.id));
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(trophy.id);
    }
  });
  li.appendChild(row);
  return li;
}

/** Render the trophy guide into the detail pane. */
export function renderDetail(detailBody, trophy, earned, spoilersOn, onToggle) {
  const hidden = isSpoilerHidden(trophy, earned, spoilersOn);
  detailBody.innerHTML = "";
  detailBody.hidden = false;

  const title = document.createElement("h2");
  title.textContent = hidden ? "Hidden story trophy" : trophy.name;
  detailBody.appendChild(title);

  const gradeRow = document.createElement("div");
  gradeRow.className = "detail-grade";
  const grade = document.createElement("span");
  grade.className = "grade-badge " + trophy.grade;
  grade.textContent = trophy.grade;
  gradeRow.appendChild(grade);
  const kind = document.createElement("span");
  kind.className = "tag";
  kind.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  gradeRow.appendChild(kind);
  if (trophy.missable) {
    const miss = document.createElement("span");
    miss.className = "tag missable";
    miss.textContent = "Missable";
    gradeRow.appendChild(miss);
  }
  detailBody.appendChild(gradeRow);

  const desc = document.createElement("p");
  desc.className = "detail-desc";
  desc.textContent = hidden
    ? "This story trophy is hidden by the spoiler setting. Earn it to reveal its official description and guide."
    : "Official description: “" + trophy.description + "”";
  detailBody.appendChild(desc);

  if (!hidden) {
    const guideSection = document.createElement("div");
    guideSection.className = "detail-section";
    const guideTitle = document.createElement("h3");
    guideTitle.textContent = "Guide";
    guideSection.appendChild(guideTitle);
    const guideText = document.createElement("p");
    guideText.textContent = trophy.guide;
    guideSection.appendChild(guideText);
    detailBody.appendChild(guideSection);

    const factsSection = document.createElement("div");
    factsSection.className = "detail-section";
    const factsTitle = document.createElement("h3");
    factsTitle.textContent = "Facts";
    factsSection.appendChild(factsTitle);
    const facts = document.createElement("ul");
    facts.className = "detail-facts";
    const factRows = [
      ["Kind", KIND_LABELS[trophy.kind] || trophy.kind],
      ["Roadmap stage", "Stage " + trophy.roadmap],
      ["Missable", trophy.missable ? "Yes — earn it when it appears" : "No"],
    ];
    if (trophy.psnCount != null) factRows.push(["PSN progress count", formatCount(trophy)]);
    for (const [label, value] of factRows) {
      const li = document.createElement("li");
      const a = document.createElement("span");
      a.textContent = label;
      const b = document.createElement("span");
      b.textContent = value;
      li.appendChild(a);
      li.appendChild(b);
      facts.appendChild(li);
    }
    factsSection.appendChild(facts);
    detailBody.appendChild(factsSection);

    const sourceSection = document.createElement("div");
    sourceSection.className = "detail-section";
    const sourceTitle = document.createElement("h3");
    sourceTitle.textContent = "Sources";
    sourceSection.appendChild(sourceTitle);
    const sourceList = document.createElement("ul");
    sourceList.className = "source-list";
    for (const source of trophy.sources || []) {
      const li = document.createElement("li");
      if (source.url) {
        const a = document.createElement("a");
        a.href = source.url;
        a.textContent = source.label;
        a.rel = "noopener";
        li.appendChild(a);
      } else {
        li.textContent = source.label;
      }
      sourceList.appendChild(li);
    }
    sourceSection.appendChild(sourceList);
    detailBody.appendChild(sourceSection);

    if (trophy.missable) {
      const warn = document.createElement("p");
      warn.className = "missable-warning";
      warn.textContent = "Missable: earn this during its story moment or while its character or partner is available. Whether it can be replayed afterwards is not yet checked in the game.";
      detailBody.appendChild(warn);
    }
  }

  const actions = document.createElement("div");
  actions.className = "detail-actions";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "btn";
  toggle.textContent = earned.has(trophy.id) ? "Mark as not earned" : "Mark as earned";
  toggle.addEventListener("click", () => onToggle(trophy.id, !earned.has(trophy.id)));
  actions.appendChild(toggle);
  detailBody.appendChild(actions);
}

/** Render the four roadmap stages with per-stage progress. */
export function renderRoadmap(container, trophies, earned, onSelect) {
  container.innerHTML = "";
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.roadmap === stage.stage);
    const done = members.filter((t) => earned.has(t.id)).length;
    const box = document.createElement("div");
    box.className = "roadmap-stage";
    const title = document.createElement("h3");
    title.textContent = stage.title;
    box.appendChild(title);
    const text = document.createElement("p");
    text.textContent = stage.text;
    box.appendChild(text);
    const prog = document.createElement("div");
    prog.className = "stage-progress";
    prog.textContent = done + " / " + members.length + " earned";
    box.appendChild(prog);
    const bar = document.createElement("div");
    bar.className = "stage-bar";
    const fill = document.createElement("span");
    fill.style.width = members.length ? (100 * done / members.length) + "%" : "0%";
    bar.appendChild(fill);
    box.appendChild(bar);
    const list = document.createElement("ul");
    list.className = "stage-trophies";
    for (const t of members) {
      const li = document.createElement("li");
      if (earned.has(t.id)) li.className = "earned";
      const mark = document.createElement("span");
      mark.textContent = earned.has(t.id) ? "✓" : "○";
      const name = document.createElement("span");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = t.name;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        onSelect(t.id);
      });
      name.appendChild(link);
      if (t.missable) {
        const miss = document.createElement("span");
        miss.className = "tag missable";
        miss.textContent = "Missable";
        name.appendChild(document.createTextNode(" "));
        name.appendChild(miss);
      }
      li.appendChild(mark);
      li.appendChild(name);
      list.appendChild(li);
    }
    box.appendChild(list);
    container.appendChild(box);
  }
}
