import { MatchSimulation } from "./simulation.js?v=21";
import { FootballRenderer } from "./render.js?v=21";
import { MatchAudio } from "./audio.js?v=21";
import {
  COUNTRY_DATABASE,
  COUNTRY_OPTIONS,
  FORMATION_OPTIONS,
  FORMATIONS,
  MATCH,
  MATCH_TEAM_CODES,
  TACTIC_OPTIONS,
} from "./data.js?v=21";

const canvas = document.querySelector("#pitchCanvas");
const renderer = new FootballRenderer(canvas);
const simulation = new MatchSimulation();
const audio = new MatchAudio();
window.__autoFootballDebug = {
  getSnapshot: () => simulation.getSnapshot(),
};

const ui = {
  homeName: document.querySelector("#homeName"),
  awayName: document.querySelector("#awayName"),
  homeCrest: document.querySelector("#homeCrest"),
  awayCrest: document.querySelector("#awayCrest"),
  homeScore: document.querySelector("#homeScore"),
  awayScore: document.querySelector("#awayScore"),
  homeYellowCards: document.querySelector("#homeYellowCards"),
  homeRedCards: document.querySelector("#homeRedCards"),
  awayYellowCards: document.querySelector("#awayYellowCards"),
  awayRedCards: document.querySelector("#awayRedCards"),
  clock: document.querySelector("#matchClock"),
  matchTotal: document.querySelector("#matchTotal"),
  round: document.querySelector("#roundNumber"),
  phase: document.querySelector("#phaseText"),
  event: document.querySelector("#eventText"),
  lastResult: document.querySelector("#lastResult"),
  matchNotice: document.querySelector("#matchNotice"),
  noticeTitle: document.querySelector("#noticeTitle"),
  noticeMessage: document.querySelector("#noticeMessage"),
  settingsToggle: document.querySelector("#settingsToggle"),
  setupPanel: document.querySelector("#setupPanel"),
  homeTeamSelect: document.querySelector("#homeTeamSelect"),
  awayTeamSelect: document.querySelector("#awayTeamSelect"),
  homeFormationSelect: document.querySelector("#homeFormationSelect"),
  awayFormationSelect: document.querySelector("#awayFormationSelect"),
  homeTacticSelect: document.querySelector("#homeTacticSelect"),
  awayTacticSelect: document.querySelector("#awayTacticSelect"),
  homeLineupEditor: document.querySelector("#homeLineupEditor"),
  awayLineupEditor: document.querySelector("#awayLineupEditor"),
  matchLengthSelect: document.querySelector("#matchLengthSelect"),
  soundToggle: document.querySelector("#soundToggle"),
  startMatchButton: document.querySelector("#startMatchButton"),
};

let lastFrame = performance.now();
let lastSoundEvent = "";
const lineupSelects = {
  home: [],
  away: [],
};
const sideControls = {
  home: {
    teamSelect: ui.homeTeamSelect,
    formationSelect: ui.homeFormationSelect,
    tacticSelect: ui.homeTacticSelect,
    lineupEditor: ui.homeLineupEditor,
  },
  away: {
    teamSelect: ui.awayTeamSelect,
    formationSelect: ui.awayFormationSelect,
    tacticSelect: ui.awayTacticSelect,
    lineupEditor: ui.awayLineupEditor,
  },
};

simulation.addEventListener("match-event", () => {
  updateUi(simulation.getSnapshot());
});

populateTeamSelect(ui.homeTeamSelect, MATCH_TEAM_CODES[0]);
populateTeamSelect(ui.awayTeamSelect, MATCH_TEAM_CODES[1]);
populateFormationSelect(ui.homeFormationSelect);
populateFormationSelect(ui.awayFormationSelect);
populateTacticSelect(ui.homeTacticSelect);
populateTacticSelect(ui.awayTacticSelect);
setSideDefaults("home", MATCH_TEAM_CODES[0]);
setSideDefaults("away", MATCH_TEAM_CODES[1]);
ui.matchLengthSelect.value = String(MATCH.seconds);
ui.settingsToggle.addEventListener("click", toggleSetupPanel);
ui.homeTeamSelect.addEventListener("change", () => handleTeamChanged("home"));
ui.awayTeamSelect.addEventListener("change", () => handleTeamChanged("away"));
ui.homeFormationSelect.addEventListener("change", () => renderLineupEditor("home"));
ui.awayFormationSelect.addEventListener("change", () => renderLineupEditor("away"));
ui.soundToggle.addEventListener("change", handleSoundToggle);
ui.startMatchButton.addEventListener("click", startConfiguredMatch);

function frame(now) {
  const dt = Math.max(0, (now - lastFrame) / 1000);
  lastFrame = now;
  simulation.update(dt);
  const snapshot = simulation.getSnapshot();
  updateUi(snapshot);
  updateDebugAttributes(snapshot);
  renderer.draw(snapshot);
  requestAnimationFrame(frame);
}

function updateUi(snapshot) {
  const [home, away] = snapshot.teams;
  ui.homeName.textContent = home.name;
  ui.awayName.textContent = away.name;
  ui.homeCrest.textContent = home.crestText;
  ui.awayCrest.textContent = away.crestText;
  document.documentElement.style.setProperty("--home", home.primary);
  document.documentElement.style.setProperty("--away", away.primary);
  ui.homeScore.textContent = String(home.score);
  ui.awayScore.textContent = String(away.score);
  ui.homeYellowCards.textContent = String(home.yellowCards ?? 0);
  ui.homeRedCards.textContent = String(home.redCards ?? 0);
  ui.awayYellowCards.textContent = String(away.yellowCards ?? 0);
  ui.awayRedCards.textContent = String(away.redCards ?? 0);
  ui.clock.textContent = formatClock(Math.min(snapshot.matchSeconds, snapshot.clock));
  ui.matchTotal.textContent = `本场总时长 ${formatDurationLabel(snapshot.matchSeconds)}`;
  ui.round.textContent = String(snapshot.round);
  ui.phase.textContent = snapshot.phaseText;
  ui.event.textContent = snapshot.eventText;
  ui.lastResult.textContent = snapshot.lastResult ? `上一局：${snapshot.lastResult}` : "上一局：暂无";
  updateMatchNotice(snapshot.notice);
  playEventSound(snapshot.eventText);
}

function updateMatchNotice(notice) {
  const isVisible = notice && notice.timer > 0;
  ui.matchNotice.classList.toggle("is-hidden", !isVisible);
  ui.matchNotice.classList.toggle("is-offside", isVisible && notice.type === "offside");
  ui.matchNotice.classList.toggle("is-yellow", isVisible && notice.type === "yellow");
  ui.matchNotice.classList.toggle("is-substitution", isVisible && notice.type === "substitution");
  if (!isVisible) return;
  ui.noticeTitle.textContent = notice.title;
  ui.noticeMessage.textContent = notice.message;
}

function formatClock(secondsLeft) {
  const safeSeconds = Math.max(0, Math.ceil(secondsLeft));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatDurationLabel(seconds) {
  const minutes = Math.round(seconds / 60);
  return `${minutes} 分钟`;
}

function updateDebugAttributes(snapshot) {
  const owner = snapshot.ball.owner;
  document.documentElement.dataset.ballMode = snapshot.ball.mode;
  document.documentElement.dataset.ballOwner = owner ? `${owner.teamId}-${owner.number}` : "";
  document.documentElement.dataset.ballSpeed = Math.hypot(snapshot.ball.vx, snapshot.ball.vy).toFixed(2);
  document.documentElement.dataset.stallTimer = (snapshot.ball.stallTimer || 0).toFixed(2);
}

function populateTeamSelect(select, selectedCode) {
  const fragment = document.createDocumentFragment();
  for (const country of COUNTRY_OPTIONS) {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = `${country.name} (${country.crestText})`;
    option.selected = country.code === selectedCode;
    fragment.append(option);
  }
  select.replaceChildren(fragment);
}

function populateFormationSelect(select) {
  const fragment = document.createDocumentFragment();
  for (const formation of FORMATION_OPTIONS) {
    const option = document.createElement("option");
    option.value = formation.id;
    option.textContent = formation.name;
    fragment.append(option);
  }
  select.replaceChildren(fragment);
}

function populateTacticSelect(select) {
  const fragment = document.createDocumentFragment();
  const autoOption = document.createElement("option");
  autoOption.value = "auto";
  autoOption.textContent = "自动";
  fragment.append(autoOption);
  for (const tactic of TACTIC_OPTIONS) {
    const option = document.createElement("option");
    option.value = tactic.id;
    option.textContent = tactic.name;
    fragment.append(option);
  }
  select.replaceChildren(fragment);
}

function handleTeamChanged(side) {
  setSideDefaults(side, sideControls[side].teamSelect.value);
}

function setSideDefaults(side, countryCode) {
  const controls = sideControls[side];
  const country = COUNTRY_DATABASE[countryCode];
  controls.formationSelect.value = FORMATIONS[country?.formation] ? country.formation : "4-3-3";
  controls.tacticSelect.value = "auto";
  renderLineupEditor(side);
}

function renderLineupEditor(side) {
  const controls = sideControls[side];
  const country = COUNTRY_DATABASE[controls.teamSelect.value];
  const slots = FORMATIONS[controls.formationSelect.value] ?? FORMATIONS["4-3-3"];
  const squad = country?.squad ?? [];
  const preferredIds = getPreferredLineupIds(country, slots.length);
  const fragment = document.createDocumentFragment();
  lineupSelects[side] = [];

  slots.forEach((slot, index) => {
    const label = document.createElement("label");
    label.className = "lineup-slot";
    const slotName = document.createElement("span");
    slotName.textContent = slot.position;
    const select = document.createElement("select");
    select.dataset.slotIndex = String(index);
    populateLineupOptions(select, squad, preferredIds[index], slot);
    select.addEventListener("change", () => syncLineupAvailability(side));
    lineupSelects[side].push(select);
    label.append(slotName, select);
    fragment.append(label);
  });

  controls.lineupEditor.replaceChildren(fragment);
  syncLineupAvailability(side);
}

function getPreferredLineupIds(country, slotCount) {
  const squad = country?.squad ?? [];
  if (!squad.length) return [];
  const squadIds = new Set(squad.map((player) => player.id));
  const usedIds = new Set();
  const ids = [];
  for (const id of country?.starterIds ?? []) {
    if (!squadIds.has(id) || usedIds.has(id)) continue;
    ids.push(id);
    usedIds.add(id);
    if (ids.length >= slotCount) return ids;
  }
  for (const player of squad) {
    if (usedIds.has(player.id)) continue;
    ids.push(player.id);
    usedIds.add(player.id);
    if (ids.length >= slotCount) return ids;
  }
  return ids;
}

function populateLineupOptions(select, squad, selectedId, slot) {
  if (!squad.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = `${slot.position} 默认`;
    option.selected = true;
    select.disabled = true;
    select.append(option);
    return;
  }

  for (const player of squad) {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = `${player.number} ${player.name} / ${player.position}`;
    option.selected = player.id === selectedId;
    select.append(option);
  }
}

function syncLineupAvailability(side) {
  const selectedIds = new Set(lineupSelects[side].map((select) => select.value).filter(Boolean));
  for (const select of lineupSelects[side]) {
    for (const option of select.options) {
      option.disabled = Boolean(option.value && option.value !== select.value && selectedIds.has(option.value));
    }
  }
}

function collectLineupIds(side) {
  return lineupSelects[side].map((select) => select.value).filter(Boolean);
}

function startConfiguredMatch() {
  audio.unlock();
  lastSoundEvent = "";
  let homeCode = ui.homeTeamSelect.value;
  let awayCode = ui.awayTeamSelect.value;
  if (homeCode === awayCode) {
    awayCode = COUNTRY_OPTIONS.find((country) => country.code !== homeCode)?.code ?? awayCode;
    ui.awayTeamSelect.value = awayCode;
    setSideDefaults("away", awayCode);
  }

  simulation.startNewMatch({
    teamCodes: [homeCode, awayCode],
    matchSeconds: Number(ui.matchLengthSelect.value) || MATCH.seconds,
    matchConfig: {
      home: {
        formation: ui.homeFormationSelect.value,
        tactic: ui.homeTacticSelect.value === "auto" ? null : ui.homeTacticSelect.value,
        lineupIds: collectLineupIds("home"),
      },
      away: {
        formation: ui.awayFormationSelect.value,
        tactic: ui.awayTacticSelect.value === "auto" ? null : ui.awayTacticSelect.value,
        lineupIds: collectLineupIds("away"),
      },
    },
  });
  updateUi(simulation.getSnapshot());
  setSetupPanelOpen(false);
}

function handleSoundToggle() {
  audio.setEnabled(ui.soundToggle.checked);
  if (ui.soundToggle.checked) audio.unlock();
}

function playEventSound(eventText) {
  if (eventText === lastSoundEvent) return;
  lastSoundEvent = eventText;
  audio.playForEvent(eventText);
}

function toggleSetupPanel() {
  setSetupPanelOpen(ui.setupPanel.classList.contains("is-hidden"));
}

function setSetupPanelOpen(isOpen) {
  ui.setupPanel.classList.toggle("is-hidden", !isOpen);
  ui.settingsToggle.setAttribute("aria-expanded", String(isOpen));
  ui.settingsToggle.textContent = isOpen ? "收起" : "设置";
}

updateUi(simulation.getSnapshot());
updateDebugAttributes(simulation.getSnapshot());
requestAnimationFrame(frame);
