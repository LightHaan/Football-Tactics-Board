import { MatchSimulation } from "./simulation.js?v=39";
import { FootballRenderer } from "./render.js?v=39";
import { MatchAudio } from "./audio.js?v=39";
import {
  COUNTRY_DATABASE,
  COUNTRY_OPTIONS,
  FORMATION_OPTIONS,
  FORMATIONS,
  MATCH,
  MATCH_TEAM_CODES,
  SUBSTITUTIONS,
  TACTIC_OPTIONS,
} from "./data.js?v=39";

const canvas = document.querySelector("#pitchCanvas");
const renderer = new FootballRenderer(canvas);
const simulation = new MatchSimulation({ autoStart: false });
const audio = new MatchAudio();
window.__autoFootballDebug = {
  getSnapshot: () => simulation.getSnapshot(),
  getTacticGuideMode: () => renderer.tacticGuideMode,
};

const ui = {
  shell: document.querySelector(".match-shell"),
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
  tacticsToggle: document.querySelector("#tacticsToggle"),
  setupPanel: document.querySelector("#setupPanel"),
  tacticsPanel: document.querySelector("#tacticsPanel"),
  homeTeamSelect: document.querySelector("#homeTeamSelect"),
  awayTeamSelect: document.querySelector("#awayTeamSelect"),
  homeFormationSelect: document.querySelector("#homeFormationSelect"),
  awayFormationSelect: document.querySelector("#awayFormationSelect"),
  homeTacticSelect: document.querySelector("#homeTacticSelect"),
  awayTacticSelect: document.querySelector("#awayTacticSelect"),
  homeLineupEditor: document.querySelector("#homeLineupEditor"),
  awayLineupEditor: document.querySelector("#awayLineupEditor"),
  tacticApplyButton: document.querySelector("#tacticApplyButton"),
  tacticStatus: document.querySelector("#tacticStatus"),
  matchLengthSelect: document.querySelector("#matchLengthSelect"),
  soundToggle: document.querySelector("#soundToggle"),
  autoSubstitutionToggle: document.querySelector("#autoSubstitutionToggle"),
  tacticGuideSelect: document.querySelector("#tacticGuideSelect"),
  startMatchButton: document.querySelector("#startMatchButton"),
  substitutionTeamSelect: document.querySelector("#substitutionTeamSelect"),
  substitutionOutSelect: document.querySelector("#substitutionOutSelect"),
  substitutionInSelect: document.querySelector("#substitutionInSelect"),
  substitutionButton: document.querySelector("#substitutionButton"),
  substitutionCount: document.querySelector("#substitutionCount"),
  substitutionStatus: document.querySelector("#substitutionStatus"),
};

let lastFrame = performance.now();
let lastSoundEvent = "";
const lineupSelects = {
  home: [],
  away: [],
};
const substitutionControls = {
  signature: "",
  selectedTeamId: "home",
  selectedOutId: "",
  selectedInId: "",
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
ui.tacticsToggle.addEventListener("click", toggleTacticsPanel);
ui.homeTeamSelect.addEventListener("change", () => handleTeamChanged("home"));
ui.awayTeamSelect.addEventListener("change", () => handleTeamChanged("away"));
ui.homeFormationSelect.addEventListener("change", () => renderLineupEditor("home"));
ui.awayFormationSelect.addEventListener("change", () => renderLineupEditor("away"));
ui.tacticApplyButton.addEventListener("click", handleApplyTactics);
ui.soundToggle.addEventListener("change", handleSoundToggle);
ui.tacticGuideSelect.addEventListener("change", handleTacticGuideChanged);
ui.startMatchButton.addEventListener("click", startConfiguredMatch);
ui.substitutionTeamSelect.addEventListener("change", handleSubstitutionTeamChanged);
ui.substitutionOutSelect.addEventListener("change", handleSubstitutionPlayerChanged);
ui.substitutionInSelect.addEventListener("change", handleSubstitutionPlayerChanged);
ui.substitutionButton.addEventListener("click", handleManualSubstitution);

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
  updateTacticApplyButtonState(snapshot);
  updateSubstitutionControls(snapshot);
  playEventSound(snapshot.eventText);
}

function updateMatchNotice(notice) {
  const isVisible = notice && notice.timer > 0;
  ui.matchNotice.classList.toggle("is-hidden", !isVisible);
  ui.matchNotice.classList.toggle("is-offside", isVisible && notice.type === "offside");
  ui.matchNotice.classList.toggle("is-yellow", isVisible && notice.type === "yellow");
  ui.matchNotice.classList.toggle("is-red", isVisible && notice.type === "red");
  ui.matchNotice.classList.toggle("is-penalty", isVisible && notice.type === "penalty");
  ui.matchNotice.classList.toggle("is-free-kick", isVisible && notice.type === "freeKick");
  ui.matchNotice.classList.toggle("is-substitution", isVisible && notice.type === "substitution");
  ui.matchNotice.classList.toggle("is-goal", isVisible && notice.type === "goal");
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

function updateSubstitutionControls(snapshot, force = false) {
  const teams = snapshot.teams ?? [];
  if (!teams.length) return;
  if (!teams.some((team) => team.id === substitutionControls.selectedTeamId)) {
    substitutionControls.selectedTeamId = teams[0].id;
  }

  const signature = [
    snapshot.state,
    substitutionControls.selectedTeamId,
    teams
      .map(
        (team) =>
          `${team.id}:${team.substitutionsUsed}:${team.players.map((player) => player.id).join(",")}:${(team.bench ?? []).map((player) => player.id).join(",")}`,
      )
      .join("|"),
  ].join("::");

  if (!force && substitutionControls.signature === signature) {
    updateSubstitutionButtonState(snapshot);
    return;
  }
  substitutionControls.signature = signature;

  const team = teams.find((currentTeam) => currentTeam.id === substitutionControls.selectedTeamId) ?? teams[0];
  substitutionControls.selectedTeamId = team.id;
  populateSubstitutionTeamSelect(teams, team.id);
  populateSubstitutionPlayerSelect(ui.substitutionOutSelect, team.players, substitutionControls.selectedOutId);
  populateSubstitutionPlayerSelect(ui.substitutionInSelect, team.bench ?? [], substitutionControls.selectedInId);
  substitutionControls.selectedOutId = ui.substitutionOutSelect.value;
  substitutionControls.selectedInId = ui.substitutionInSelect.value;
  ui.substitutionCount.textContent = `${team.substitutionsUsed}/${SUBSTITUTIONS.maxPerTeam}`;
  updateSubstitutionButtonState(snapshot);
}

function populateSubstitutionTeamSelect(teams, selectedTeamId) {
  const fragment = document.createDocumentFragment();
  for (const team of teams) {
    const option = document.createElement("option");
    option.value = team.id;
    option.textContent = `${team.shortName} (${team.substitutionsUsed}/${SUBSTITUTIONS.maxPerTeam})`;
    option.selected = team.id === selectedTeamId;
    fragment.append(option);
  }
  ui.substitutionTeamSelect.replaceChildren(fragment);
}

function populateSubstitutionPlayerSelect(select, players, selectedId) {
  const fragment = document.createDocumentFragment();
  for (const player of players) {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = `${player.number} ${player.name} / ${player.position}`;
    option.selected = player.id === selectedId;
    fragment.append(option);
  }
  select.replaceChildren(fragment);
}

function updateSubstitutionButtonState(snapshot) {
  const team = snapshot.teams.find((currentTeam) => currentTeam.id === substitutionControls.selectedTeamId);
  const hasSelection = Boolean(ui.substitutionOutSelect.value && ui.substitutionInSelect.value);
  const matchStarted = ["playing", "goalPause", "restartPause"].includes(snapshot.state);
  const canUse = team && matchStarted && team.substitutionsUsed < SUBSTITUTIONS.maxPerTeam && hasSelection;
  ui.substitutionButton.disabled = !canUse;
}

function updateTacticApplyButtonState(snapshot) {
  ui.tacticApplyButton.disabled = snapshot.state === "preMatch" || snapshot.state === "fullTime";
}

function handleApplyTactics() {
  audio.unlock();
  const results = [
    applySideTactics("home", ui.homeFormationSelect.value, ui.homeTacticSelect.value),
    applySideTactics("away", ui.awayFormationSelect.value, ui.awayTacticSelect.value),
  ];
  const ok = results.every((result) => result.ok);
  setTacticStatus(results.map((result) => result.message).join("；"), ok);
  if (ok) substitutionControls.signature = "";
  updateUi(simulation.getSnapshot());
}

function applySideTactics(teamId, formation, tactic) {
  return simulation.applyTeamTactics(teamId, {
    formation,
    tactic: tactic === "auto" ? null : tactic,
  });
}

function handleSubstitutionTeamChanged() {
  substitutionControls.selectedTeamId = ui.substitutionTeamSelect.value;
  substitutionControls.selectedOutId = "";
  substitutionControls.selectedInId = "";
  updateSubstitutionControls(simulation.getSnapshot(), true);
}

function handleSubstitutionPlayerChanged() {
  substitutionControls.selectedOutId = ui.substitutionOutSelect.value;
  substitutionControls.selectedInId = ui.substitutionInSelect.value;
  updateSubstitutionButtonState(simulation.getSnapshot());
}

function handleManualSubstitution() {
  audio.unlock();
  substitutionControls.selectedOutId = ui.substitutionOutSelect.value;
  substitutionControls.selectedInId = ui.substitutionInSelect.value;
  const result = simulation.performManualSubstitution(
    substitutionControls.selectedTeamId,
    substitutionControls.selectedOutId,
    substitutionControls.selectedInId,
  );
  setSubstitutionStatus(result.message, result.ok);
  if (result.ok) {
    substitutionControls.selectedOutId = "";
    substitutionControls.selectedInId = "";
    substitutionControls.signature = "";
  }
  updateUi(simulation.getSnapshot());
}

function setSubstitutionStatus(message, isSuccess) {
  ui.substitutionStatus.textContent = message ?? "";
  ui.substitutionStatus.classList.toggle("is-success", Boolean(isSuccess));
  ui.substitutionStatus.classList.toggle("is-error", Boolean(message && !isSuccess));
}

function setTacticStatus(message, isSuccess) {
  ui.tacticStatus.textContent = message ?? "";
  ui.tacticStatus.classList.toggle("is-success", Boolean(isSuccess));
  ui.tacticStatus.classList.toggle("is-error", Boolean(message && !isSuccess));
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
    autoSubstitutionsEnabled: ui.autoSubstitutionToggle.checked,
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
  setTacticStatus("", false);
  setSubstitutionStatus("", false);
  substitutionControls.selectedOutId = "";
  substitutionControls.selectedInId = "";
  substitutionControls.signature = "";
  updateUi(simulation.getSnapshot());
  setSetupPanelOpen(false);
}

function handleSoundToggle() {
  audio.setEnabled(ui.soundToggle.checked);
  if (ui.soundToggle.checked) audio.unlock();
}

function handleTacticGuideChanged() {
  renderer.setTacticGuideMode(ui.tacticGuideSelect.value);
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
  if (isOpen) setTacticsPanelOpen(false);
  ui.setupPanel.classList.toggle("is-hidden", !isOpen);
  ui.settingsToggle.setAttribute("aria-expanded", String(isOpen));
  ui.settingsToggle.textContent = isOpen ? "收起" : "设置";
  updatePanelStateClass();
}

function toggleTacticsPanel() {
  setTacticsPanelOpen(ui.tacticsPanel.classList.contains("is-hidden"));
}

function setTacticsPanelOpen(isOpen) {
  if (isOpen) setSetupPanelOpen(false);
  ui.tacticsPanel.classList.toggle("is-hidden", !isOpen);
  ui.tacticsToggle.setAttribute("aria-expanded", String(isOpen));
  ui.tacticsToggle.textContent = isOpen ? "收起" : "战术";
  updatePanelStateClass();
}

function updatePanelStateClass() {
  const setupOpen = !ui.setupPanel.classList.contains("is-hidden");
  const tacticsOpen = !ui.tacticsPanel.classList.contains("is-hidden");
  ui.shell.classList.toggle("has-open-panel", setupOpen || tacticsOpen);
  ui.shell.classList.toggle("has-setup-panel", setupOpen);
  ui.shell.classList.toggle("has-tactics-panel", tacticsOpen);
}

updateUi(simulation.getSnapshot());
updateDebugAttributes(simulation.getSnapshot());
renderer.setTacticGuideMode(ui.tacticGuideSelect.value);
setSetupPanelOpen(true);
requestAnimationFrame(frame);
