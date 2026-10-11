import { matchesTag, tagPath } from "./tag-hierarchy";
import { secondaryOptions } from "./taxonomy-rules";

// Each Astro page instance owns its listeners; before-swap releases them below.
export function initializeTaxonomyIndex() {
  const root = document.querySelector<HTMLElement>("[data-taxonomy-index]");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "true";
  type Group = "primary" | "secondary" | "cross";
  const state: Record<Group, string> = { primary: "", secondary: "", cross: "" };
  const displayButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-display]")];
  let display = "list";
  function setDisplay(value: string) {
    display = ["list", "titles", "cards", "wall"].includes(value) ? value : "list";
    root!.querySelector<HTMLElement>("[data-results-display]")!.dataset.resultsDisplay = display;
    for (const button of displayButtons) button.setAttribute("aria-pressed", String(button.dataset.display === display));
  }
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-group]")];
  const sections = [...root.querySelectorAll<HTMLDetailsElement>("[data-filter-group]")];
  const rows = [...root.querySelectorAll<HTMLElement>("[data-index-item]")].map(element => ({ element, item: JSON.parse(element.dataset.item!) as { primary: string; secondary: string; cross: string[] } }));
  const branches = [...root.querySelectorAll<HTMLButtonElement>("[data-branch-toggle]")].map(toggle => {
    const container = toggle.closest<HTMLElement>(".tag-branch")!;
    const parent = container.querySelector<HTMLButtonElement>("[data-group]")!;
    const children = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    return { toggle, parent, children };
  });
  function openBranch(target: typeof branches[number], open: boolean) {
    for (const branch of branches) {
      if (branch.parent.dataset.group !== target.parent.dataset.group) continue;
      const expanded = branch === target && open;
      branch.children.hidden = !expanded;
      branch.toggle.setAttribute("aria-expanded", String(expanded));
      branch.toggle.textContent = expanded ? "▼" : "▶";
    }
  }
  function readUrl() {
    const params = new URL(location.href).searchParams;
    setDisplay(params.get("display") || "list");
    for (const group of Object.keys(state) as Group[]) {
      const value = params.get(group) || "";
      state[group] = buttons.some(b => b.dataset.group === group && b.dataset.value === value) ? value : "";
    }
  }
  function update(save = true) {
    const allowedSecondary = secondaryOptions(state.primary);
    const secondaryEnabled = allowedSecondary.length > 0;
    const availableSecondary = (value: string): boolean => {
      if (!secondaryEnabled) return false;
      if (!value) return true;
      if (!allowedSecondary.includes(value)) return false;

      // Availability depends on Content type, not on the cross-cutting filter.
      return rows.some(({ item }) =>
        matchesTag("primary", state.primary, [item.primary]) &&
        matchesTag("secondary", value, [item.secondary])
      );
    };
    if (!availableSecondary(state.secondary)) state.secondary = "";
    const secondarySection = sections.find(s => s.dataset.filterGroup === "secondary")!;
    secondarySection.hidden = !secondaryEnabled;
    for (const button of buttons.filter(b => b.dataset.group === "secondary")) {
      const value = button.dataset.value!;
      const available = availableSecondary(value);
      button.hidden = !available;
      button.disabled = !available;
    }
    for (const branch of branches) {
      const hasChildren = [...branch.children.querySelectorAll<HTMLButtonElement>("[data-group]")].some(button => !button.hidden);
      branch.toggle.hidden = !hasChildren;
      if (!hasChildren) {
        branch.children.hidden = true;
        branch.toggle.setAttribute("aria-expanded", "false");
        branch.toggle.textContent = "▶";
      }
    }
    for (const branch of root!.querySelectorAll<HTMLElement>(".tag-branch")) {
      const parent = branch.querySelector<HTMLButtonElement>(":scope > button[data-group]")!;
      branch.hidden = parent.hidden;
    }
    for (const label of root!.querySelectorAll<HTMLElement>("[data-selection-label]")) {
      const selected = state[label.dataset.selectionLabel as Group];
      label.textContent = selected ? `· ${selected}` : "";
    }
    let count = 0;
    for (const {element, item} of rows) {
      element.hidden = !matchesTag("primary", state.primary, [item.primary]) || !matchesTag("secondary", state.secondary, [item.secondary]) || !matchesTag("cross", state.cross, item.cross);
      if (!element.hidden) count++;
    }
    for (const button of buttons) button.setAttribute("aria-pressed", String(state[button.dataset.group as Group] === button.dataset.value));
    root!.querySelector("[data-result-count]")!.textContent = `${count} of ${rows.length} entries`;
    root!.querySelector<HTMLElement>("[data-empty]")!.hidden = count > 0;
    if (save) {
      const url = new URL(location.href); url.search = "";
      if (display !== "list") url.searchParams.set("display", display);
      for (const [key,value] of Object.entries(state)) if (value) url.searchParams.set(key,value);
      history.replaceState(history.state,"",url);
    }
  }
  const events = new AbortController();
  for (const button of displayButtons) button.addEventListener("click", () => {
    setDisplay(button.dataset.display!);
    update();
  }, { signal: events.signal });
  function adjustSections() {
    for (const section of sections) {
      section.open = section.dataset.filterGroup !== "cross" || !!state[section.dataset.filterGroup as Group];
    }
  }
  for (const section of sections) section.querySelector("summary")!.addEventListener("click", event => {
    const expandable = section.dataset.filterGroup === "cross";
    if (!expandable) event.preventDefault();
  }, { signal: events.signal });
  for (const branch of branches) branch.toggle.addEventListener("click", () => {
    openBranch(branch, branch.children.hidden);
  }, { signal: events.signal });
  for (const button of buttons) button.addEventListener("click", event => {
    if (button.classList.contains("section-all")) { event.preventDefault(); event.stopPropagation(); }
    const group = button.dataset.group as Group;
    const value = button.dataset.value!;
    state[group] = state[group] === value ? "" : value;
    update();
  }, { signal: events.signal });
  root.querySelector("[data-clear]")!.addEventListener("click", () => {
    state.primary = state.secondary = state.cross = "";
    update();
    for (const list of root.querySelectorAll<HTMLElement>(".filter-list")) list.scrollTo({ left: 0, top: 0, behavior: "instant" });
  }, { signal: events.signal });
  window.addEventListener("popstate", () => { readUrl(); update(false); }, { signal: events.signal });
  document.addEventListener("astro:before-swap", () => { events.abort(); }, { once: true });
  readUrl(); update(); adjustSections();
  for (const branch of branches) {
    const selected = state[branch.parent.dataset.group as Group];
    if (selected !== branch.parent.dataset.value && tagPath(branch.parent.dataset.group!, selected).includes(branch.parent.dataset.value!)) openBranch(branch, true);
  }
}
