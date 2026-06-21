import { DISCIPLINE, FIELD, FOULS, MATCH, MATCH_TEAM_CODES, OFFSIDE, RESTART_EVENTS, SUBSTITUTIONS, buildTeams } from "./data.js?v=30";

const CENTER_Y = FIELD.height / 2;
const GOAL_TOP = CENTER_Y - FIELD.goalWidth / 2;
const GOAL_BOTTOM = CENTER_Y + FIELD.goalWidth / 2;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (min, max) => min + Math.random() * (max - min);
const chance = (value) => Math.random() < clamp(value, 0, 1);

export class MatchSimulation extends EventTarget {
  constructor(options = {}) {
    super();
    this.round = 1;
    this.lastResult = null;
    this.matchTeamCodes = options.teamCodes ?? MATCH_TEAM_CODES;
    this.matchSeconds = options.matchSeconds ?? MATCH.seconds;
    this.matchConfig = options.matchConfig ?? {};
    this.autoSubstitutionsEnabled = options.autoSubstitutionsEnabled ?? true;
    this.resetMatch();
  }

  resetMatch(options = {}) {
    if (options.teamCodes) this.matchTeamCodes = options.teamCodes;
    if (options.matchSeconds) this.matchSeconds = options.matchSeconds;
    if (options.matchConfig) this.matchConfig = options.matchConfig;
    if (typeof options.autoSubstitutionsEnabled === "boolean") {
      this.autoSubstitutionsEnabled = options.autoSubstitutionsEnabled;
    }
    this.teams = buildTeams(this.matchTeamCodes, this.matchConfig);
    this.players = this.teams.flatMap((team) => team.players);
    this.clock = 0;
    this.state = "playing";
    this.pauseTimer = 0;
    this.phaseText = "开球";
    this.eventText = "比赛开始";
    this.restartContext = null;
    this.discipline = this.createDisciplinePlan();
    this.offside = this.createOffsidePlan();
    this.fouls = this.createFoulState();
    this.restartStats = this.createRestartStats();
    this.substitutionPlan = this.autoSubstitutionsEnabled ? this.createSubstitutionPlan() : null;
    this.matchNotice = null;
    this.referee = this.createReferee();
    this.ball = {
      x: FIELD.width / 2,
      y: CENTER_Y,
      vx: 0,
      vy: 0,
      mode: "owned",
      owner: null,
      teamId: null,
      targetPlayer: null,
      targetX: FIELD.width / 2,
      targetY: CENTER_Y,
      speed: 0,
      quality: 0,
      shotTeamId: null,
      shotPlayer: null,
      passKind: null,
      looseTimer: 0,
      stallTimer: 0,
      lastX: FIELD.width / 2,
      lastY: CENTER_Y,
      trail: [],
      carrierStallTimer: 0,
      goalLineActionCooldown: 0,
      lastOwnerId: null,
      lastOwnerX: FIELD.width / 2,
      lastOwnerY: CENTER_Y,
      goalkeeperHoldTimer: 0,
      releaseIgnorePlayerId: null,
      releaseIgnoreTimer: 0,
      restartKind: null,
    };
    this.kickoff(Math.random() > 0.5 ? this.teams[0] : this.teams[1], "开球");
  }

  update(realDt) {
    const dt = Math.min(realDt, 0.05) * MATCH.timeScale;

    if (this.state === "goalPause" || this.state === "fullTime" || this.state === "restartPause") {
      this.pauseTimer -= dt;
      this.updateMatchNotice(dt);
      this.updateOffsideState(dt);
      this.updateFoulState(dt);
      this.updateReferee(dt);
      if (this.state === "restartPause") this.setRestartTargets();
      else this.setRestingTargets();
      this.movePlayers(dt);
      if (this.state === "restartPause" && this.pauseTimer <= 0) {
        this.completeRestart();
        return;
      }
      if (this.state === "goalPause" && this.pauseTimer <= 0) {
        const concedingTeam = this.teams.find((team) => team.id !== this.ball.shotTeamId);
        this.kickoff(concedingTeam, "重新开球");
        this.state = "playing";
      }
      if (this.state === "fullTime" && this.pauseTimer <= 0) {
        this.round += 1;
        this.resetMatch();
      }
      return;
    }

    this.clock += dt;
    this.updateMatchNotice(dt);
    this.updateOffsideState(dt);
    this.updateFoulState(dt);
    if (this.clock >= this.matchSeconds) {
      this.finishMatch();
      return;
    }

    this.updateReferee(dt);
    this.checkDisciplineEvents();
    this.checkSubstitutionEvents();
    this.updateTactics(dt);
    this.updateCarrierDecision(dt);
    if (this.state !== "playing") return;
    this.movePlayers(dt);
    this.updateBall(dt);
    this.resolveCarrierStall(dt);
    this.checkPressure(dt);
    this.checkRestartRhythmEvents(dt);
    this.updatePhaseText();
  }

  createDisciplinePlan() {
    const earliest = Math.min(12, this.matchSeconds * 0.18);
    const latest = Math.max(earliest + 1, this.matchSeconds * 0.82);
    const redEarliest = Math.min(30, this.matchSeconds * 0.28);
    const redLatest = Math.max(redEarliest + 1, this.matchSeconds * 0.86);
    return {
      yellowCardsPerMatch: DISCIPLINE.yellowCardsPerMatch,
      redCardsPerMatch: DISCIPLINE.redCardsPerMatch,
      yellowIssued: 0,
      redIssued: 0,
      nextYellowAt: DISCIPLINE.yellowCardsPerMatch > 0 ? rand(earliest, latest) : Infinity,
      nextRedAt: DISCIPLINE.redCardsPerMatch > 0 ? rand(redEarliest, redLatest) : Infinity,
    };
  }

  createOffsidePlan() {
    return {
      enabled: OFFSIDE.enabled,
      cooldown: 0,
      count: 0,
    };
  }

  createFoulState() {
    return {
      enabled: FOULS.enabled,
      cooldown: 0,
      count: 0,
      penalties: 0,
    };
  }

  createRestartStats() {
    return {
      corners: 0,
      throwIns: 0,
      goalKicks: 0,
    };
  }

  createSubstitutionPlan() {
    const earliest = this.matchSeconds * 0.52;
    const latest = Math.max(earliest + 1, this.matchSeconds * 0.78);
    return this.teams.map((team) => ({
      teamId: team.id,
      time: rand(earliest, latest),
      done: false,
    }));
  }

  createReferee() {
    return {
      x: FIELD.width / 2,
      y: CENTER_Y + 8,
      vx: 0,
      vy: 0,
      targetX: FIELD.width / 2,
      targetY: CENTER_Y + 8,
      cardFlashTimer: 0,
      cardColor: "#ffd532",
      whistleTimer: 0,
    };
  }

  kickoff(team, message) {
    this.players.forEach((player) => {
      player.x = player.anchor.x + rand(-1.2, 1.2);
      player.y = player.anchor.y + rand(-1.2, 1.2);
      player.vx = 0;
      player.vy = 0;
      player.decisionTimer = rand(0.2, 0.9);
      player.tackleTimer = rand(0.1, 0.7);
    });

    const taker = team.players
      .filter((player) => player.role !== "GK")
      .reduce((best, player) => (dist(player, this.ball) < dist(best, this.ball) ? player : best));

    taker.x = FIELD.width / 2 - team.direction * 1.5;
    taker.y = CENTER_Y + rand(-1.8, 1.8);
    this.ball.x = FIELD.width / 2;
    this.ball.y = CENTER_Y;
    this.ball.restartKind = null;
    this.takePossession(taker);
    this.eventText = `${team.shortName} ${message}，本局主打${team.tactic.name}`;
    this.emitUpdate();
  }

  updateReferee(dt) {
    if (!this.referee) return;
    const focus = this.ball.owner ?? this.ball;
    const sideOffset = focus.y < CENTER_Y ? 7 : -7;
    const trailingX = this.ball.teamId ? (this.getTeam(this.ball.teamId)?.direction ?? 1) * -5 : -4;
    this.referee.targetX = clamp(focus.x + trailingX, 8, FIELD.width - 8);
    this.referee.targetY = clamp(focus.y + sideOffset, 8, FIELD.height - 8);
    const desired = normalize(this.referee.targetX - this.referee.x, this.referee.targetY - this.referee.y);
    const distance = Math.hypot(this.referee.targetX - this.referee.x, this.referee.targetY - this.referee.y);
    const speed = clamp(distance * 1.35, 0, 8.2);
    this.referee.vx += (desired.x * speed - this.referee.vx) * clamp(dt * 4.4, 0, 1);
    this.referee.vy += (desired.y * speed - this.referee.vy) * clamp(dt * 4.4, 0, 1);
    this.referee.x = clamp(this.referee.x + this.referee.vx * dt, 3, FIELD.width - 3);
    this.referee.y = clamp(this.referee.y + this.referee.vy * dt, 3, FIELD.height - 3);
    this.referee.cardFlashTimer = Math.max(0, this.referee.cardFlashTimer - dt);
    this.referee.whistleTimer = Math.max(0, this.referee.whistleTimer - dt);
  }

  updateMatchNotice(dt) {
    if (!this.matchNotice) return;
    this.matchNotice.timer = Math.max(0, this.matchNotice.timer - dt);
  }

  updateOffsideState(dt) {
    if (!this.offside) return;
    this.offside.cooldown = Math.max(0, this.offside.cooldown - dt);
  }

  updateFoulState(dt) {
    if (!this.fouls) return;
    this.fouls.cooldown = Math.max(0, this.fouls.cooldown - dt);
  }

  showMatchNotice(type, title, message, teamId = null, duration = 2.4) {
    this.matchNotice = {
      type,
      title,
      message,
      teamId,
      timer: duration,
      duration,
    };
  }

  checkDisciplineEvents() {
    if (this.state !== "playing") return;
    if (this.discipline.yellowIssued < this.discipline.yellowCardsPerMatch && this.clock >= this.discipline.nextYellowAt) {
      this.issueRandomYellowCard();
    }
    if (this.state !== "playing") return;
    if (this.discipline.redIssued < this.discipline.redCardsPerMatch && this.clock >= this.discipline.nextRedAt) {
      this.issueRandomRedCard();
    }
  }

  issueRandomYellowCard() {
    const protectedIds = this.getProtectedPlayerIds();
    const candidates = this.players.filter((player) => player.role !== "GK" && !protectedIds.has(player.id));
    const weighted = candidates.map((player) => ({
      player,
      score:
        ({ CB: 4.5, FB: 3.4, DM: 4.2, CM: 2.8, W: 1.7, AM: 1.4, ST: 1.2 }[player.role] ?? 2) +
        (player.yellowCards ? 1.1 : 0) +
        rand(0, 2.2),
    }));
    const picked = pickWeighted(weighted);
    if (!picked) return;
    this.issueCard(picked.player, "yellow");
    this.scheduleNextDisciplineCard("yellow");
  }

  issueRandomRedCard() {
    const protectedIds = this.getProtectedPlayerIds();
    const candidates = this.players.filter((player) => player.role !== "GK" && !protectedIds.has(player.id));
    const weighted = candidates.map((player) => ({
      player,
      score:
        ({ CB: 3.8, FB: 3.2, DM: 3.5, CM: 2.3, W: 1.4, AM: 1.2, ST: 1.1 }[player.role] ?? 2) +
        rand(0, 1.8),
    }));
    const picked = pickWeighted(weighted);
    if (!picked) return;
    this.issueCard(picked.player, "red");
    this.scheduleNextDisciplineCard("red");
  }

  scheduleNextDisciplineCard(kind) {
    const issuedKey = kind === "red" ? "redIssued" : "yellowIssued";
    const targetKey = kind === "red" ? "redCardsPerMatch" : "yellowCardsPerMatch";
    const nextKey = kind === "red" ? "nextRedAt" : "nextYellowAt";
    if (this.discipline[issuedKey] >= this.discipline[targetKey]) {
      this.discipline[nextKey] = Infinity;
      return;
    }
    const remainingWindow = Math.max(1, this.matchSeconds - this.clock - 5);
    this.discipline[nextKey] = Math.min(this.matchSeconds - 4, this.clock + rand(8, remainingWindow));
  }

  issueCard(player, cardType) {
    if (!player || player.redCards) return { type: "none", text: "" };
    const team = this.getTeam(player.teamId);
    if (!team) return { type: "none", text: "" };
    const isRed = cardType === "red";

    if (!isRed) {
      team.yellowCards += 1;
      player.yellowCards = (player.yellowCards ?? 0) + 1;
      this.discipline.yellowIssued += 1;
      const yellowLimit = DISCIPLINE.yellowCardsBeforeRed ?? 2;
      if (player.yellowCards >= yellowLimit) {
        return this.sendOffPlayer(player, team, { secondYellow: true });
      }

      this.referee.cardFlashTimer = 2.2;
      this.referee.cardColor = "#ffd532";
      this.referee.whistleTimer = 1.1;
      this.referee.x = lerp(this.referee.x, player.x, 0.45);
      this.referee.y = lerp(this.referee.y, player.y, 0.45);
      this.eventText = `${team.shortName} ${playerLabel(player)}吃到黄牌`;
      this.phaseText = "黄牌";
      this.showMatchNotice("yellow", "黄牌", `${team.shortName} ${playerLabel(player)}`, team.id, 2.8);
      this.emitUpdate();
      return { type: "yellow", text: "黄牌" };
    }

    return this.sendOffPlayer(player, team, { straightRed: true });
  }

  sendOffPlayer(player, team, reason = {}) {
    if (team.players.length <= 7) {
      this.referee.whistleTimer = 1.1;
      this.eventText = `${team.shortName} ${playerLabel(player)}动作过大，裁判口头警告`;
      this.phaseText = "犯规";
      this.emitUpdate();
      return { type: "warning", text: "口头警告" };
    }
    team.redCards += 1;
    player.redCards = 1;
    this.discipline.redIssued += 1;
    const title = reason.secondYellow ? "两黄变红" : "红牌";
    const text = reason.secondYellow ? "两黄变一红" : "红牌罚下";
    this.referee.cardFlashTimer = 2.4;
    this.referee.cardColor = "#e93636";
    this.referee.whistleTimer = 1.25;
    this.referee.x = lerp(this.referee.x, player.x, 0.45);
    this.referee.y = lerp(this.referee.y, player.y, 0.45);
    this.eventText = `${team.shortName} ${playerLabel(player)}${text}`;
    this.phaseText = title;
    this.showMatchNotice("red", title, `${team.shortName} ${playerLabel(player)}`, team.id, 3.2);
    this.removePlayerFromMatch(player, team);
    this.emitUpdate();
    return { type: "red", text };
  }

  removePlayerFromMatch(player, team) {
    team.players = team.players.filter((current) => current.id !== player.id);
    this.players = this.teams.flatMap((currentTeam) => currentTeam.players);
    if (this.ball.owner?.id === player.id) {
      this.ball.owner = null;
      this.ball.mode = "loose";
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.speed = 0;
      this.ball.restartKind = null;
    }
    if (this.ball.targetPlayer?.id === player.id) this.ball.targetPlayer = null;
    if (this.ball.shotPlayer?.id === player.id) this.ball.shotPlayer = null;
  }

  getProtectedPlayerIds() {
    return new Set([this.ball.owner?.id, this.ball.targetPlayer?.id, this.ball.shotPlayer?.id].filter(Boolean));
  }

  checkSubstitutionEvents() {
    if (!this.substitutionPlan) return;
    for (const plan of this.substitutionPlan) {
      if (plan.done || this.clock < plan.time) continue;
      plan.done = true;
      const team = this.getTeam(plan.teamId);
      if (team) this.performRandomSubstitution(team);
    }
  }

  performRandomSubstitution(team) {
    if (team.substitutionsUsed >= SUBSTITUTIONS.maxPerTeam) return false;
    const incoming = this.pickSubstitute(team);
    if (!incoming) return false;
    const outgoing = this.pickOutgoingForSubstitution(team, incoming);
    if (!outgoing) return false;
    const result = this.performSubstitution(team, incoming, outgoing);
    return result.ok;
  }

  performManualSubstitution(teamId, outgoingId, incomingId) {
    const team = this.getTeam(teamId);
    if (!team) return { ok: false, message: "没有找到球队" };
    if (this.state === "fullTime") return { ok: false, message: "全场结束后不能换人" };
    if (team.substitutionsUsed >= SUBSTITUTIONS.maxPerTeam) return { ok: false, message: "换人次数已用完" };
    const outgoing = team.players.find((player) => player.id === outgoingId);
    if (!outgoing) return { ok: false, message: "没有找到要换下的球员" };
    const incoming = (team.bench ?? []).find((player) => player.id === incomingId);
    if (!incoming) return { ok: false, message: "没有找到替补球员" };
    if (this.isPlayerInActiveBallAction(outgoing)) {
      return { ok: false, message: `${playerLabel(outgoing)}正在处理球，稍后再换` };
    }
    return this.performSubstitution(team, incoming, outgoing, { manual: true });
  }

  performSubstitution(team, incoming, outgoing, options = {}) {
    const playerIndex = team.players.findIndex((player) => player.id === outgoing.id);
    if (playerIndex < 0) return { ok: false, message: "没有找到要换下的球员" };

    const replacement = {
      ...outgoing,
      id: `${team.id}-${incoming.databaseId ?? `sub-${incoming.number}`}-${team.substitutionsUsed + 1}`,
      number: incoming.number,
      name: incoming.name,
      nativePosition: incoming.nativePosition ?? incoming.position,
      nativeRole: incoming.nativeRole ?? incoming.role,
      marketValueM: incoming.marketValueM ?? 0,
      databaseId: incoming.databaseId ?? null,
      attributes: incoming.attributes ?? outgoing.attributes,
      yellowCards: 0,
      redCards: 0,
      vx: 0,
      vy: 0,
      decisionTimer: rand(0.12, 0.5),
      tackleTimer: rand(0.2, 0.7),
      staminaNoise: Math.random() * 0.1 + 0.98,
    };

    team.players[playerIndex] = replacement;
    team.bench = (team.bench ?? []).filter((player) => player.id !== incoming.id);
    team.substitutionsUsed += 1;
    team.substitutions.push({
      in: { name: replacement.name, number: replacement.number, position: replacement.position },
      out: { name: outgoing.name, number: outgoing.number, position: outgoing.position },
      clock: this.clock,
    });
    this.players = this.teams.flatMap((currentTeam) => currentTeam.players);

    this.phaseText = "换人";
    const prefix = options.manual ? "手动换人" : "换人";
    this.eventText = `${team.shortName} ${prefix}：${playerLabel(replacement)}换下${playerLabel(outgoing)}`;
    this.referee.whistleTimer = 0.65;
    this.showMatchNotice("substitution", "换人", `${team.shortName} ${playerLabel(replacement)}上，${playerLabel(outgoing)}下`, team.id, 3);
    this.emitUpdate();
    return { ok: true, message: `${team.shortName} ${replacement.name} 上场` };
  }

  isPlayerInActiveBallAction(player) {
    return [this.ball.owner?.id, this.ball.targetPlayer?.id, this.ball.shotPlayer?.id, this.restartContext?.takerId].includes(player.id);
  }

  pickSubstitute(team) {
    const bench = team.bench ?? [];
    if (!bench.length) return null;
    const outfield = bench.filter((player) => player.role !== "GK");
    const pool = outfield.length ? outfield : bench;
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }

  pickOutgoingForSubstitution(team, incoming) {
    const protectedIds = new Set(
      [this.ball.owner?.id, this.ball.targetPlayer?.id, this.ball.shotPlayer?.id].filter(Boolean),
    );
    const candidates = team.players.filter((player) => player.role !== "GK" && !protectedIds.has(player.id));
    if (!candidates.length) return null;
    const sameRole = candidates.filter((player) => player.role === incoming.role);
    const sameLine = candidates.filter((player) => roleGroup(player.role) === roleGroup(incoming.role));
    const pool = sameRole.length ? sameRole : sameLine.length ? sameLine : candidates;
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }

  finishMatch() {
    const [home, away] = this.teams;
    this.clock = this.matchSeconds;
    this.state = "fullTime";
    this.pauseTimer = MATCH.fullTimePauseSeconds;
    this.lastResult = `${home.name} ${home.score}:${away.score} ${away.name}`;
    this.phaseText = "全场结束";
    this.eventText = `全场结束，比分 ${home.score}:${away.score}`;
    this.ball.owner = null;
    this.ball.mode = "loose";
    this.ball.passKind = null;
    this.ball.restartKind = null;
    this.restartContext = null;
    this.emitUpdate();
  }

  takePossession(player, eventText = null) {
    this.ball.mode = "owned";
    this.ball.owner = player;
    this.ball.teamId = player.teamId;
    this.ball.targetPlayer = null;
    this.ball.shotPlayer = null;
    this.ball.passKind = null;
    this.ball.restartKind = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.speed = 0;
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    if (this.ball.lastOwnerId !== player.id) this.ball.carrierStallTimer = 0;
    this.ball.lastOwnerId = player.id;
    this.ball.lastOwnerX = player.x;
    this.ball.lastOwnerY = player.y;
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;
    this.ball.goalkeeperHoldTimer = player.role === "GK" ? 0 : this.ball.goalkeeperHoldTimer;
    this.ball.releaseIgnorePlayerId = null;
    this.ball.releaseIgnoreTimer = 0;
    if (eventText) this.eventText = eventText;
    player.decisionTimer = player.role === "GK" ? rand(0.12, 0.34) : rand(0.15, 0.55);
  }

  startNewMatch(options = {}) {
    this.round = 1;
    this.lastResult = null;
    this.resetMatch(options);
  }

  updateTactics(dt) {
    const owner = this.ball.owner;
    const ballPoint = { x: this.ball.x, y: this.ball.y };
    const isLoose = !owner && this.ball.mode === "loose";
    const isGoalLinePossession = !!owner && this.isNearGoalLineScramble(ballPoint);

    for (const team of this.teams) {
      const hasBall = owner?.teamId === team.id;
      const opponents = this.getOpponents(team.id);
      const nearestPressers = hasBall ? [] : this.getPressers(team, ballPoint);

      for (const player of team.players) {
        const baseTarget = this.getBaseTarget(player, team, hasBall, ballPoint, opponents);
        player.targetX = baseTarget.x;
        player.targetY = baseTarget.y;

        if (player === owner) {
          this.setCarrierTarget(player, team);
          continue;
        }

        if (!hasBall && nearestPressers.first === player) {
          const press = this.getPressTarget(player, ballPoint, team);
          player.targetX = press.x;
          player.targetY = press.y;
        } else if (!hasBall && nearestPressers.second === player) {
          const cover = this.getCoverTarget(team, ballPoint);
          player.targetX = cover.x;
          player.targetY = cover.y;
        } else if (isGoalLinePossession) {
          const support = this.getGoalLinePossessionTarget(player, team, ballPoint, owner);
          if (support) {
            player.targetX = support.x;
            player.targetY = support.y;
          }
        } else if (isLoose && this.isNearGoalLineScramble(ballPoint)) {
          const support = this.getGoalLineScrambleTarget(player, team, ballPoint);
          player.targetX = support.x;
          player.targetY = support.y;
        }
      }
    }

    this.players.forEach((player) => {
      if (player.role === "GK") this.constrainGoalkeeper(player);
      player.tackleTimer = Math.max(0, player.tackleTimer - dt);
      player.decisionTimer = Math.max(0, player.decisionTimer - dt);
    });
  }

  getBaseTarget(player, team, hasBall, ballPoint, opponents) {
    const tactic = team.tactic;
    if (player.role === "GK") {
      const ownGoalX = team.direction === 1 ? 0 : FIELD.width;
      const keeperX = ownGoalX + team.direction * clamp(Math.abs(ballPoint.x - ownGoalX) * 0.16, 4.2, 12.5);
      return {
        x: keeperX,
        y: clamp(lerp(CENTER_Y, ballPoint.y, 0.26), GOAL_TOP - 3, GOAL_BOTTOM + 3),
      };
    }

    const direction = team.direction;
    const laneWeight = hasBall ? lerp(0.14, 0.26, tactic.shape.width) : 0.36;
    const roleAdvance = {
      CB: hasBall ? 4.5 : -5.5,
      FB: hasBall ? 7.5 : -6.5,
      DM: hasBall ? 7 : -7,
      CM: hasBall ? 10 : -8,
      AM: hasBall ? 11 : -8,
      W: hasBall ? 12 : -9,
      ST: hasBall ? 9 : -10,
    }[player.role] ?? 0;
    const tacticalAdvance = hasBall ? tactic.shape.roleAdvance[player.role] ?? 0 : 0;

    const ballPullX = (ballPoint.x - player.anchor.x) * (hasBall ? 0.11 : 0.15);
    const ballPullY = (ballPoint.y - player.anchor.y) * laneWeight;
    let targetX = player.anchor.x + direction * (roleAdvance + tacticalAdvance) + ballPullX;
    let targetY = player.anchor.y + ballPullY;

    if (hasBall) {
      const passLane = this.getLaneOpening(player, opponents);
      targetY += passLane;
      if (player.role === "W" || player.role === "FB") {
        targetY = lerp(targetY, player.anchor.y, tactic.shape.width * 0.72);
        targetX += direction * tactic.shape.width * (player.role === "W" ? 2.4 : 1.5);
      }
      if (player.role === "CM" || player.role === "AM" || player.role === "W") {
        targetY = lerp(targetY, CENTER_Y, tactic.shape.centralTuck);
      }
      if (player.role === "ST") targetY = lerp(targetY, CENTER_Y, 0.34 + tactic.shape.centralTuck * 0.3);
      const lineRun = this.getLineRunTarget(player, team, ballPoint, opponents, targetX);
      if (lineRun) targetX = lineRun.x;
    } else {
      const ownGoalX = direction === 1 ? 0 : FIELD.width;
      const danger = 1 - clamp(Math.abs(ballPoint.x - ownGoalX) / FIELD.width, 0, 1);
      targetX -= direction * danger * 6;
      if (player.role === "ST") targetX += direction * 5;
    }

    return {
      x: clamp(targetX, 4, FIELD.width - 4),
      y: clamp(targetY, 4, FIELD.height - 4),
    };
  }

  getLineRunTarget(player, team, ballPoint, opponents, baseTargetX) {
    if (!["ST", "W", "AM"].includes(player.role)) return null;
    const attackProgress = team.direction * (ballPoint.x - FIELD.width / 2);
    if (attackProgress < -10) return null;

    const line = this.getSecondLastOpponentLine(opponents, team.direction);
    const roleDepth = player.role === "ST" ? 3.2 : player.role === "W" ? 1.6 : 0.4;
    const roleSupport = player.role === "ST" ? 2.2 : player.role === "W" ? 5.4 : 8;
    const runCycle = Math.sin(this.clock * 0.62 + player.order * 1.73);
    const trapDepth = runCycle > 0.52 ? roleDepth : -roleSupport;
    const lineTarget = clamp(line + team.direction * trapDepth, 4, FIELD.width - 4);
    const blend = player.role === "ST" ? 0.82 : 0.28;
    return {
      x: clamp(lerp(baseTargetX, lineTarget, blend), 4, FIELD.width - 4),
    };
  }

  getLaneOpening(player, opponents) {
    const closeAbove = opponents.filter((opponent) => opponent.y < player.y && dist(player, opponent) < 13).length;
    const closeBelow = opponents.filter((opponent) => opponent.y >= player.y && dist(player, opponent) < 13).length;
    if (closeAbove > closeBelow) return 4.4;
    if (closeBelow > closeAbove) return -4.4;
    return rand(-1.8, 1.8);
  }

  getPressers(team, ballPoint) {
    const pressDistance = team.tactic.defense.pressDistance;
    const sorted = team.players
      .filter((player) => player.role !== "GK")
      .map((player) => ({ player, distance: dist(player, ballPoint) }))
      .sort((a, b) => a.distance - b.distance);
    return {
      first: sorted[0]?.player,
      second: sorted[1]?.distance < pressDistance ? sorted[1].player : null,
    };
  }

  getPressTarget(player, ballPoint, team) {
    const ownGoalX = team.direction === 1 ? 0 : FIELD.width;
    return {
      x: clamp(lerp(ballPoint.x, ownGoalX, 0.07), 2, FIELD.width - 2),
      y: clamp(ballPoint.y + rand(-0.8, 0.8), 2, FIELD.height - 2),
    };
  }

  getCoverTarget(team, ballPoint) {
    const ownGoalX = team.direction === 1 ? 0 : FIELD.width;
    const coverDepth = team.tactic.defense.coverDepth;
    return {
      x: clamp(lerp(ballPoint.x, ownGoalX, coverDepth), 4, FIELD.width - 4),
      y: clamp(lerp(ballPoint.y, CENTER_Y, 0.22), 5, FIELD.height - 5),
    };
  }

  isNearGoalLineScramble(ballPoint) {
    return ballPoint.x < FIELD.penaltyDepth + 3 || ballPoint.x > FIELD.width - FIELD.penaltyDepth - 3;
  }

  getGoalLineScrambleTarget(player, team, ballPoint) {
    if (player.role === "GK") {
      return this.getBaseTarget(player, team, false, ballPoint, this.getOpponents(team.id));
    }
    const defendingOwnGoalX = team.direction === 1 ? 0 : FIELD.width;
    const defending = Math.abs(ballPoint.x - defendingOwnGoalX) < FIELD.penaltyDepth + 6;
    const goalX = ballPoint.x < FIELD.width / 2 ? 0 : FIELD.width;
    const order = player.order % 6;
    if (defending) {
      return {
        x: clamp(goalX + (goalX === 0 ? 1 : -1) * (7 + (order % 3) * 4), 3, FIELD.width - 3),
        y: clamp(lerp(GOAL_TOP - 4, GOAL_BOTTOM + 4, order / 5), 4, FIELD.height - 4),
      };
    }
    const attackLane = player.role === "W" || player.role === "FB" ? player.anchor.y : lerp(player.anchor.y, CENTER_Y, 0.58);
    return {
      x: clamp(goalX + (goalX === 0 ? 1 : -1) * (8 + (order % 4) * 3.2), 4, FIELD.width - 4),
      y: clamp(attackLane + rand(-1.2, 1.2), 5, FIELD.height - 5),
    };
  }

  getGoalLinePossessionTarget(player, team, ballPoint, owner) {
    if (player === owner) return null;
    if (player.role === "GK") {
      return this.getBaseTarget(player, team, owner?.teamId === team.id, ballPoint, this.getOpponents(team.id));
    }

    const attackingTeam = this.getTeam(owner.teamId);
    const attacking = player.teamId === attackingTeam.id;
    const goalX = attackingTeam.direction === 1 ? FIELD.width : 0;
    const towardField = -attackingTeam.direction;
    const ballSide = ballPoint.y < CENTER_Y ? -1 : 1;
    const run = Math.sin(this.clock * 1.35 + player.order * 0.82);
    const yJitter = run * 1.5;

    if (attacking) {
      const roleIndex = player.order % 6;
      if (player.role === "ST") {
        return {
          x: clamp(goalX + towardField * (5.2 + roleIndex * 0.7 + run * 0.8), 3, FIELD.width - 3),
          y: clamp(lerp(CENTER_Y, ballPoint.y, 0.18) + ballSide * 2.4 + yJitter, GOAL_TOP - 4, GOAL_BOTTOM + 4),
        };
      }
      if (player.role === "AM" || player.role === "CM") {
        return {
          x: clamp(goalX + towardField * (16 + (roleIndex % 2) * 5 + run * 1.4), 5, FIELD.width - 5),
          y: clamp(CENTER_Y + (roleIndex % 2 === 0 ? -8 : 8) + yJitter, 9, FIELD.height - 9),
        };
      }
      if (player.role === "W") {
        const farPostY = ballPoint.y < CENTER_Y ? GOAL_BOTTOM + 4 : GOAL_TOP - 4;
        return {
          x: clamp(goalX + towardField * (7 + (roleIndex % 3) * 3 + run), 4, FIELD.width - 4),
          y: clamp(lerp(farPostY, CENTER_Y, 0.18) + yJitter, 5, FIELD.height - 5),
        };
      }
      return {
        x: clamp(goalX + towardField * (24 + (roleIndex % 3) * 4), 6, FIELD.width - 6),
        y: clamp(lerp(player.anchor.y, CENTER_Y, 0.28) + yJitter, 6, FIELD.height - 6),
      };
    }

    const defensiveIndex = player.order % 7;
    if (player.role === "CB" || player.role === "FB") {
      return {
        x: clamp(goalX + towardField * (3.8 + (defensiveIndex % 3) * 2.2), 2.5, FIELD.width - 2.5),
        y: clamp(lerp(GOAL_TOP - 3, GOAL_BOTTOM + 3, defensiveIndex / 6) + yJitter * 0.55, 4, FIELD.height - 4),
      };
    }
    if (player.role === "DM" || player.role === "CM") {
      return {
        x: clamp(goalX + towardField * (15 + (defensiveIndex % 2) * 4), 4, FIELD.width - 4),
        y: clamp(lerp(CENTER_Y, ballPoint.y, 0.38) + (defensiveIndex % 2 === 0 ? -6 : 6), 6, FIELD.height - 6),
      };
    }
    return {
      x: clamp(goalX + towardField * (22 + (defensiveIndex % 3) * 5), 5, FIELD.width - 5),
      y: clamp(lerp(player.anchor.y, CENTER_Y, 0.2) + yJitter, 5, FIELD.height - 5),
    };
  }

  setCarrierTarget(player, team) {
    if (this.ball.mode !== "owned") return;
    const tactic = team.tactic;
    const opponents = this.getOpponents(team.id);
    const nearest = this.nearestPlayer(player, opponents);
    const pressure = nearest ? clamp((8 - dist(player, nearest)) / 8, 0, 1) : 0;
    const sidelineEscape = player.y < 10 ? 5 : player.y > FIELD.height - 10 ? -5 : 0;
    const corridor = player.y < CENTER_Y ? -1 : 1;
    const nearAttackingGoalLine = team.direction === 1 ? player.x > FIELD.width - 7.5 : player.x < 7.5;
    if (nearAttackingGoalLine) {
      player.targetX = clamp(player.x - team.direction * lerp(2.4, 5.8, pressure), 3, FIELD.width - 3);
      player.targetY = clamp(lerp(player.y, CENTER_Y, 0.18) + sidelineEscape + corridor * rand(-1, 1.4), 4, FIELD.height - 4);
    } else {
      player.targetX = clamp(
        player.x + team.direction * lerp(3.2, 9.5, 1 - pressure) * tactic.actions.dribbleForward,
        3,
        FIELD.width - 3,
      );
      player.targetY = clamp(player.y + sidelineEscape + corridor * rand(-1.8, 2.2), 4, FIELD.height - 4);
    }
    if ((player.role === "W" || player.role === "FB") && tactic.id === "wingCross") {
      player.targetY = clamp(lerp(player.targetY, player.anchor.y, 0.52), 4, FIELD.height - 4);
    } else if (tactic.id === "centralPenetration") {
      player.targetY = clamp(lerp(player.targetY, CENTER_Y, 0.28), 4, FIELD.height - 4);
    }
  }

  constrainGoalkeeper(player) {
    const team = this.getTeam(player.teamId);
    const minX = team.direction === 1 ? 1.8 : FIELD.width - FIELD.penaltyDepth + 2;
    const maxX = team.direction === 1 ? FIELD.penaltyDepth - 1.5 : FIELD.width - 1.8;
    player.targetX = clamp(player.targetX, minX, maxX);
    player.targetY = clamp(player.targetY, GOAL_TOP - 5, GOAL_BOTTOM + 5);
  }

  updateCarrierDecision() {
    const carrier = this.ball.owner;
    if (!carrier || this.ball.mode !== "owned") return;

    const team = this.getTeam(carrier.teamId);
    const opponents = this.getOpponents(team.id);
    const nearestDefender = this.nearestPlayer(carrier, opponents);
    const pressureDistance = nearestDefender ? dist(carrier, nearestDefender) : 99;
    const pressure = clamp((9 - pressureDistance) / 9, 0, 1);

    if (carrier.decisionTimer > 0) {
      const earlyTrapPass = this.chooseOffsideTrapPass(carrier, team, opponents, pressure);
      if (!earlyTrapPass) return;
      carrier.decisionTimer = 0;
    }

    if (carrier.role === "GK") {
      this.distributeFromGoalkeeper(carrier, team, opponents, pressure);
      return;
    }

    const goalX = team.direction === 1 ? FIELD.width : 0;
    const distanceToGoal = Math.abs(goalX - carrier.x);
    const centerBias = 1 - clamp(Math.abs(carrier.y - CENTER_Y) / 28, 0, 1);
    const shotWindow = distanceToGoal < 23 && centerBias > 0.32;
    const attackProgress = team.direction * (carrier.x - FIELD.width / 2);
    const longShotWindow =
      distanceToGoal >= 23 &&
      distanceToGoal < 38 &&
      centerBias > 0.38 &&
      attackProgress > -2 &&
      !["GK", "CB"].includes(carrier.role);
    const shotUrge =
      shotWindow
        ? (carrier.attributes.shooting / 100) *
          centerBias *
          (1 - distanceToGoal / 26) *
          (pressure < 0.7 ? 1 : 0.72) *
          team.tactic.actions.shotMultiplier
        : 0;
    const longShotUrge =
      longShotWindow
        ? (carrier.attributes.shooting / 100) *
          centerBias *
          (1 - distanceToGoal / 44) *
          (pressure < 0.66 ? 1 : 0.58) *
          team.tactic.actions.shotMultiplier
        : 0;

    const tacticalPass = this.chooseTacticalPass(carrier, team, opponents, pressure);
    if (tacticalPass && chance(tacticalPass.chance)) {
      this.pass(carrier, tacticalPass.player, team, tacticalPass.score, tacticalPass.context);
      return;
    }

    const offsideTrapPass = this.chooseOffsideTrapPass(carrier, team, opponents, pressure);
    if (offsideTrapPass && chance(offsideTrapPass.chance)) {
      this.pass(carrier, offsideTrapPass.player, team, offsideTrapPass.score, offsideTrapPass.context);
      return;
    }

    if (chance(longShotUrge * 0.055)) {
      this.shoot(carrier, team, pressure, { longShot: true });
      return;
    }

    if (chance(shotUrge * 0.18)) {
      this.shoot(carrier, team, pressure);
      return;
    }

    const pass = this.choosePass(carrier, team, opponents, pressure);
    const shouldPass = pass && (pressure > 0.36 || chance(team.tactic.passing.passRate + pass.score / 420));
    if (shouldPass) {
      this.pass(carrier, pass.player, team, pass.score);
      return;
    }

    carrier.decisionTimer = rand(0.35, 0.95);
  }

  distributeFromGoalkeeper(keeper, team, opponents, pressure) {
    this.ball.goalkeeperHoldTimer += 0.35;
    const outlet = this.chooseGoalkeeperOutlet(keeper, team, opponents);
    const mustRelease = this.ball.goalkeeperHoldTimer > 1.1 || pressure > 0.42;
    if (outlet && (mustRelease || chance(0.82))) {
      this.ball.goalkeeperHoldTimer = 0;
      this.pass(keeper, outlet.player, team, outlet.score, {
        kind: "keeperDistribution",
        eventText: `${team.shortName} ${playerLabel(keeper)}分球给${playerLabel(outlet.player)}`,
        lead: {
          x: clamp(outlet.player.x + team.direction * clamp(outlet.distance * 0.12, 1.4, 4.8), 1.5, FIELD.width - 1.5),
          y: clamp(outlet.player.y + rand(-1.2, 1.2), 1.5, FIELD.height - 1.5),
        },
        qualityBonus: 0.03,
      });
      return;
    }

    if (mustRelease || !outlet) {
      this.ball.goalkeeperHoldTimer = 0;
      this.goalkeeperLongKick(keeper, team, `${team.shortName} ${playerLabel(keeper)}大脚开向前场`);
      return;
    }

    keeper.decisionTimer = rand(0.16, 0.34);
  }

  chooseGoalkeeperOutlet(keeper, team, opponents) {
    const candidates = team.players
      .filter((player) => player !== keeper && player.role !== "GK")
      .map((player) => {
        const distance = dist(keeper, player);
        const forwardGain = team.direction * (player.x - keeper.x);
        const laneSafety = this.passLaneSafety(keeper, player, opponents);
        const roleBonus = { CB: 18, FB: 22, DM: 20, CM: 14, W: 10, AM: 8, ST: 6 }[player.role] ?? 8;
        const pressureSpace = clamp(this.nearestDistance(player, opponents), 0, 18);
        const score =
          keeper.attributes.passing * 0.72 +
          roleBonus +
          forwardGain * 0.55 +
          laneSafety * 42 +
          pressureSpace * 1.8 -
          Math.abs(distance - 24) * 1.05 +
          rand(-8, 10);
        return { player, score, distance, forwardGain, laneSafety };
      })
      .filter((item) => item.distance > 9 && item.distance < 50 && item.forwardGain > -5 && item.laneSafety > 0.08)
      .sort((a, b) => b.score - a.score);
    return candidates[0] ?? null;
  }

  choosePass(carrier, team, opponents, pressure) {
    const tactic = team.tactic;
    const candidates = team.players
      .filter((player) => player !== carrier)
      .filter((player) => player.role !== "GK" || pressure > 0.72)
      .map((player) => {
        const distance = dist(carrier, player);
        const forwardGain = team.direction * (player.x - carrier.x);
        const laneSafety = this.passLaneSafety(carrier, player, opponents);
        const receivingPressure = this.nearestDistance(player, opponents);
        const distancePenalty = Math.abs(distance - 19) * 1.7;
        const widthScore = Math.abs(player.y - CENTER_Y) / CENTER_Y;
        const centralScore = 1 - widthScore;
        const strikerScore = player.role === "ST" ? 1 : player.role === "AM" ? 0.45 : 0;
        const score =
          carrier.attributes.passing * 0.9 +
          player.attributes.speed * 0.2 +
          forwardGain * tactic.passing.forwardWeight +
          laneSafety * 60 +
          widthScore * tactic.passing.wingBonus +
          centralScore * tactic.passing.centralBonus +
          strikerScore * tactic.passing.strikerBonus +
          clamp(receivingPressure, 0, 15) * 2.2 -
          distancePenalty +
          rand(-14, 18);
        return { player, score, distance, laneSafety };
      })
      .filter((item) => item.distance > 5 && item.distance < 43 && item.laneSafety > 0.18)
      .sort((a, b) => b.score - a.score);

    return candidates[0] ?? null;
  }

  chooseTacticalPass(carrier, team, opponents, pressure) {
    const tactic = team.tactic;
    const cross = tactic.id === "wingCross" ? this.chooseCross(carrier, team, opponents, pressure) : null;
    if (cross) return cross;
    const through =
      tactic.id === "centralPenetration" || tactic.actions.throughChance > 0.12
        ? this.chooseThroughPass(carrier, team, opponents, pressure)
        : null;
    return through;
  }

  chooseOffsideTrapPass(carrier, team, opponents, pressure) {
    if (carrier.role === "GK" || carrier.role === "CB") return null;
    const carrierProgress = team.direction * (carrier.x - FIELD.width / 2);
    if (carrierProgress < -8) return null;

    const candidates = team.players
      .filter((player) => player !== carrier && player.role !== "GK")
      .map((player) => {
        const judgement = this.getOffsideJudgement(carrier, player, team, { kind: "through" });
        const distance = dist(carrier, player);
        const forwardGain = team.direction * (player.x - carrier.x);
        const laneSafety = this.passLaneSafety(carrier, player, opponents);
        const roleBonus = player.role === "ST" ? 34 : player.role === "W" ? 16 : player.role === "AM" ? 8 : 0;
        const score =
          roleBonus +
          forwardGain * 1.5 +
          laneSafety * 28 +
          judgement.gap * 18 -
          Math.abs(distance - 24) * 1.1 +
          rand(-6, 8);
        return { player, judgement, distance, forwardGain, laneSafety, score };
      })
      .filter((item) => item.judgement.isOffsidePosition)
      .filter((item) => item.distance > 9 && item.distance < 43 && item.forwardGain > 4)
      .sort((a, b) => b.score - a.score);

    const target = candidates[0];
    if (!target) return null;
    return {
      player: target.player,
      score: target.score + 18,
      chance: clamp(0.12 + target.judgement.gap * 0.04 + pressure * 0.04, 0.1, 0.28),
      context: {
        kind: "through",
        eventText: `${team.shortName} ${playerLabel(carrier)}直塞给${playerLabel(target.player)}`,
        lead: {
          x: clamp(target.player.x + team.direction * 2.6, 1.5, FIELD.width - 1.5),
          y: clamp(target.player.y + rand(-1, 1), 1.5, FIELD.height - 1.5),
        },
        qualityBonus: -0.04,
      },
    };
  }

  chooseCross(carrier, team, opponents, pressure) {
    if (!this.isInCrossingZone(carrier, team)) return null;
    const targetRoles = new Set(["ST", "AM", "CM", "W"]);
    const targets = team.players
      .filter((player) => player !== carrier && targetRoles.has(player.role))
      .map((player) => {
        const distance = dist(carrier, player);
        const laneSafety = this.passLaneSafety(carrier, player, opponents);
        const boxRun = clamp(team.direction * (player.x - FIELD.width / 2) / (FIELD.width / 2), 0, 1);
        const centerRun = 1 - clamp(Math.abs(player.y - CENTER_Y) / 26, 0, 1);
        const roleBonus = player.role === "ST" ? 38 : player.role === "AM" ? 22 : player.role === "W" ? 10 : 4;
        const score =
          player.attributes.shooting * 0.28 +
          player.attributes.speed * 0.14 +
          laneSafety * 28 +
          boxRun * 28 +
          centerRun * 22 +
          roleBonus -
          Math.abs(distance - 24) * 0.9 +
          rand(-8, 12);
        return { player, score, distance, laneSafety };
      })
      .filter((item) => item.distance > 8 && item.distance < 46 && item.laneSafety > 0.08)
      .sort((a, b) => b.score - a.score);
    const target = targets[0];
    if (!target) return null;
    return {
      player: target.player,
      score: target.score + 22,
      chance: team.tactic.actions.crossChance * (pressure > 0.75 ? 0.55 : 1),
      context: {
        kind: "cross",
        eventText: `${team.shortName} ${playerLabel(carrier)}下底传中找${playerLabel(target.player)}`,
        lead: {
          x: clamp(target.player.x + team.direction * 3.5, 1.5, FIELD.width - 1.5),
          y: clamp(lerp(target.player.y, CENTER_Y, 0.52) + rand(-2, 2), 1.5, FIELD.height - 1.5),
        },
        qualityBonus: 0.04,
      },
    };
  }

  chooseThroughPass(carrier, team, opponents, pressure) {
    const centrality = 1 - clamp(Math.abs(carrier.y - CENTER_Y) / 30, 0, 1);
    if (centrality < 0.45 || carrier.role === "GK" || carrier.role === "CB") return null;
    const candidates = team.players
      .filter((player) => player !== carrier && player.role !== "GK")
      .map((player) => {
        const distance = dist(carrier, player);
        const forwardGain = team.direction * (player.x - carrier.x);
        const laneSafety = this.passLaneSafety(carrier, player, opponents);
        const roleBonus = player.role === "ST" ? 28 : player.role === "AM" ? 18 : player.role === "W" ? 8 : 0;
        const score =
          forwardGain * 2.4 +
          laneSafety * 64 +
          player.attributes.speed * 0.24 +
          player.attributes.dribbling * 0.12 +
          roleBonus -
          Math.abs(distance - 21) * 1.1 +
          rand(-10, 14);
        return { player, score, distance, forwardGain, laneSafety };
      })
      .filter((item) => item.forwardGain > 5 && item.distance > 8 && item.distance < 36 && item.laneSafety > 0.24)
      .sort((a, b) => b.score - a.score);
    const target = candidates[0];
    if (!target) return null;
    return {
      player: target.player,
      score: target.score + 16,
      chance: team.tactic.actions.throughChance * centrality * (pressure > 0.78 ? 0.55 : 1),
      context: {
        kind: "through",
        eventText: `${team.shortName} ${playerLabel(carrier)}直塞给${playerLabel(target.player)}`,
        lead: {
          x: clamp(target.player.x + team.direction * clamp(target.distance * 0.24, 3, 7), 1.5, FIELD.width - 1.5),
          y: clamp(target.player.y + rand(-1.5, 1.5), 1.5, FIELD.height - 1.5),
        },
        qualityBonus: 0.06,
      },
    };
  }

  isInCrossingZone(player, team) {
    const progress = team.direction * (player.x - FIELD.width / 2);
    const width = Math.abs(player.y - CENTER_Y);
    const canCross = player.role === "W" || player.role === "FB" || player.role === "AM";
    return canCross && progress > 18 && width > 17;
  }

  passLaneSafety(from, to, opponents) {
    let closest = 99;
    for (const opponent of opponents) {
      closest = Math.min(closest, distanceToSegment(opponent, from, to));
    }
    return clamp((closest - 1.4) / 7, 0, 1);
  }

  tryCallOffside(from, to, team, context = {}) {
    if (!this.offside?.enabled || this.offside.cooldown > 0 || !to || to.role === "GK") return false;
    if (from.teamId !== to.teamId || team.id !== to.teamId) return false;

    const judgement = this.getOffsideJudgement(from, to, team, context);
    if (!judgement.isOffsidePosition) return false;

    const chanceToCall = this.getOffsideCallChance(judgement, context);
    if (!chance(chanceToCall)) return false;

    this.callOffside(from, to, team, judgement);
    return true;
  }

  getOffsideJudgement(from, to, team, context = {}) {
    const opponents = this.getOpponents(team.id);
    const line = this.getSecondLastOpponentLine(opponents, team.direction);
    const ballX = this.ball.x;
    const receiverProgress = team.direction * (to.x - FIELD.width / 2);
    const aheadOfBall = team.direction * (to.x - ballX) > 0.45;
    const beyondLine = team.direction * (to.x - line) > 0.35;
    const forwardPass = team.direction * (to.x - from.x) > 2.4;
    const actualGap = team.direction * (to.x - line);
    const gap = actualGap;
    const distanceToGoal = Math.abs((team.direction === 1 ? FIELD.width : 0) - to.x);

    return {
      line,
      actualGap,
      gap,
      judgedX: to.x,
      distanceToGoal,
      isOffsidePosition: receiverProgress > 0 && aheadOfBall && beyondLine && forwardPass,
    };
  }

  getSecondLastOpponentLine(opponents, attackingDirection) {
    const xs = opponents.map((player) => player.x).sort((a, b) => a - b);
    if (xs.length < 2) return attackingDirection === 1 ? FIELD.width : 0;
    return attackingDirection === 1 ? xs[xs.length - 2] : xs[1];
  }

  getOffsideCallChance(judgement, context) {
    const kind = context.kind ?? "pass";
    const kindChance = kind === "through" ? OFFSIDE.baseChance + OFFSIDE.throughBallBonus : kind === "cross" ? OFFSIDE.crossChance : OFFSIDE.baseChance * 0.76;
    const gapFactor = clamp((judgement.gap + 0.6) / 2.8, 0.74, 1.18);
    const finalThirdFactor = judgement.distanceToGoal < 32 ? 1.08 : 0.82;
    return clamp(kindChance * gapFactor * finalThirdFactor, 0.12, 0.88);
  }

  callOffside(from, to, attackingTeam, judgement) {
    const defendingTeam = this.teams.find((team) => team.id !== attackingTeam.id);
    const offsideX = clamp(judgement.judgedX ?? to.x, 1.5, FIELD.width - 1.5);
    to.x = offsideX;
    to.targetX = offsideX;
    const restartPoint = {
      x: clamp(offsideX - attackingTeam.direction * 1.2, 4, FIELD.width - 4),
      y: clamp(to.y, 4, FIELD.height - 4),
    };
    const taker =
      this.nearestPlayer(restartPoint, defendingTeam.players.filter((player) => player.role !== "GK")) ??
      defendingTeam.players.find((player) => player.role === "GK") ??
      defendingTeam.players[0];

    this.offside.count += 1;
    this.offside.cooldown = OFFSIDE.cooldownSeconds;
    this.state = "restartPause";
    this.pauseTimer = 1.35;
    this.restartContext = {
      type: "freeKick",
      teamId: defendingTeam.id,
      takerId: taker.id,
      point: restartPoint,
      exitSide: attackingTeam.direction,
    };
    this.ball.mode = "loose";
    this.ball.owner = null;
    this.ball.targetPlayer = null;
    this.ball.passKind = null;
    this.ball.teamId = defendingTeam.id;
    this.ball.restartKind = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.speed = 0;
    this.ball.x = restartPoint.x;
    this.ball.y = restartPoint.y;
    this.ball.trail = [];
    this.phaseText = "越位";
    this.eventText = `${attackingTeam.shortName} ${playerLabel(to)}越位，${playerLabel(from)}的传球被吹停`;
    this.referee.whistleTimer = 1.4;
    this.referee.x = lerp(this.referee.x, to.x, 0.38);
    this.referee.y = lerp(this.referee.y, to.y, 0.38);
    this.showMatchNotice("offside", "越位", `${attackingTeam.shortName} ${playerLabel(to)}`, attackingTeam.id, 2.5);
    this.emitUpdate();
  }

  pass(from, to, team, score, context = {}) {
    if (!context.skipOffside && this.tryCallOffside(from, to, team, context)) return;

    const distance = dist(from, to);
    const lead = context.lead ?? {
      x: to.x + team.direction * clamp(distance * 0.16, 1.2, 5),
      y: to.y + (to.targetY - to.y) * 0.22,
    };
    const direction = normalize(lead.x - this.ball.x, lead.y - this.ball.y);
    const speed = clamp(19 + from.attributes.passing * 0.16 + distance * 0.18, 18, 34);
    this.ball.mode = "pass";
    this.ball.owner = null;
    this.ball.teamId = team.id;
    this.ball.targetPlayer = to;
    this.ball.shotPlayer = null;
    this.ball.passKind = context.kind ?? "pass";
    this.ball.restartKind = null;
    this.ball.targetX = clamp(lead.x, 1.5, FIELD.width - 1.5);
    this.ball.targetY = clamp(lead.y, 1.5, FIELD.height - 1.5);
    this.ball.vx = direction.x * speed;
    this.ball.vy = direction.y * speed;
    this.ball.speed = speed;
    this.ball.quality = clamp(score / 140 + (context.qualityBonus ?? 0), 0.25, 0.97);
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;
    this.ball.trail = [{ x: from.x, y: from.y }];
    from.decisionTimer = rand(0.6, 1.1);
    this.eventText = context.eventText ?? `${team.shortName} ${playerLabel(from)}传给${playerLabel(to)}`;
    this.emitUpdate();
  }

  shoot(player, team, pressure, options = {}) {
    const longShot = options.longShot === true;
    const isPenalty = options.penalty === true;
    const isDirectFreeKick = options.directFreeKick === true;
    const goalX = team.direction === 1 ? FIELD.width + 1 : -1;
    const distanceToGoal = Math.abs((team.direction === 1 ? FIELD.width : 0) - player.x);
    const centerBias = 1 - clamp(Math.abs(player.y - CENTER_Y) / 28, 0, 1);
    const maxAccuracy = isPenalty ? 0.88 : isDirectFreeKick ? 0.62 : longShot ? 0.42 : 0.68;
    const accuracy = clamp(
      player.attributes.shooting / 135 +
        centerBias * 0.18 -
        pressure * 0.2 -
        distanceToGoal * 0.016 +
        (longShot ? -0.06 : 0) +
        (options.accuracyBonus ?? 0) +
        rand(-0.18, 0.12),
      0.08,
      maxAccuracy,
    );
    const onFrame = chance(accuracy);
    const targetY = onFrame
      ? clamp(CENTER_Y + rand(-FIELD.goalWidth * 0.44, FIELD.goalWidth * 0.44), GOAL_TOP + 0.45, GOAL_BOTTOM - 0.45)
      : CENTER_Y + (chance(0.5) ? -1 : 1) * rand(FIELD.goalWidth * 0.54, FIELD.goalWidth * 1.25);
    const direction = normalize(goalX - player.x, targetY - player.y);
    const quality = clamp(
      player.attributes.shooting / 125 -
        pressure * 0.24 +
        centerBias * 0.14 +
        (1 - distanceToGoal / 28) * 0.18 +
        (onFrame ? 0.08 : -0.18) +
        (longShot ? -0.06 : 0) +
        (options.qualityBonus ?? 0) +
        rand(-0.12, 0.1),
      0.08,
      isPenalty ? 0.94 : 0.86,
    );
    const speed = clamp(31 + player.attributes.shooting * 0.17 + (longShot ? 2.2 : 0) + (options.speedBonus ?? 0) + rand(-2, 3), 28, 49);

    this.ball.mode = "shot";
    this.ball.owner = null;
    this.ball.teamId = team.id;
    this.ball.shotTeamId = team.id;
    this.ball.targetPlayer = null;
    this.ball.shotPlayer = player;
    this.ball.passKind = null;
    this.ball.restartKind = options.restartKind ?? null;
    this.ball.targetX = goalX;
    this.ball.targetY = targetY;
    this.ball.vx = direction.x * speed;
    this.ball.vy = direction.y * speed;
    this.ball.speed = speed;
    this.ball.quality = quality;
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;
    this.ball.trail = [{ x: player.x, y: player.y }];
    player.decisionTimer = rand(1.0, 1.6);
    this.eventText = options.eventText ?? (longShot ? `${team.shortName} ${playerLabel(player)}尝试远射` : `${team.shortName} ${playerLabel(player)}起脚射门`);
    this.emitUpdate();
  }

  movePlayers(dt) {
    for (const player of this.players) {
      const target = this.separationAdjustedTarget(player);
      const desired = normalize(target.x - player.x, target.y - player.y);
      const distance = Math.hypot(target.x - player.x, target.y - player.y);
      const maxSpeed = this.playerSpeed(player) * (player === this.ball.owner ? 0.86 : 1);
      const speed = clamp(distance * 1.7, 0, maxSpeed);
      const ax = desired.x * speed - player.vx;
      const ay = desired.y * speed - player.vy;
      player.vx += ax * clamp(dt * 5.2, 0, 1);
      player.vy += ay * clamp(dt * 5.2, 0, 1);
      player.x = clamp(player.x + player.vx * dt, 1.5, FIELD.width - 1.5);
      player.y = clamp(player.y + player.vy * dt, 1.5, FIELD.height - 1.5);

      if (player.role === "GK") {
        const before = { x: player.x, y: player.y };
        this.constrainGoalkeeperPosition(player);
        if (before.x !== player.x || before.y !== player.y) {
          player.vx *= 0.35;
          player.vy *= 0.35;
        }
      }
    }
  }

  separationAdjustedTarget(player) {
    let offsetX = 0;
    let offsetY = 0;
    for (const other of this.players) {
      if (other === player || other.teamId !== player.teamId) continue;
      const dx = player.x - other.x;
      const dy = player.y - other.y;
      const d = Math.hypot(dx, dy);
      if (d > 0 && d < 3.5) {
        const push = (3.5 - d) / 3.5;
        offsetX += (dx / d) * push * 2.4;
        offsetY += (dy / d) * push * 2.4;
      }
    }
    return {
      x: clamp(player.targetX + offsetX, 1.5, FIELD.width - 1.5),
      y: clamp(player.targetY + offsetY, 1.5, FIELD.height - 1.5),
    };
  }

  playerSpeed(player) {
    return (4.0 + player.attributes.speed * 0.052) * player.staminaNoise;
  }

  constrainGoalkeeperPosition(player) {
    const team = this.getTeam(player.teamId);
    const minX = team.direction === 1 ? 1.4 : FIELD.width - FIELD.penaltyDepth + 1.3;
    const maxX = team.direction === 1 ? FIELD.penaltyDepth - 1.3 : FIELD.width - 1.4;
    player.x = clamp(player.x, minX, maxX);
    player.y = clamp(player.y, GOAL_TOP - 6, GOAL_BOTTOM + 6);
  }

  updateBall(dt) {
    if (this.ball.mode === "owned" && this.ball.owner) {
      const team = this.getTeam(this.ball.owner.teamId);
      this.ball.x = clamp(this.ball.owner.x + team.direction * 0.9, 0.3, FIELD.width - 0.3);
      this.ball.y = clamp(this.ball.owner.y, 0.3, FIELD.height - 0.3);
      return;
    }

    if (this.ball.mode === "pass" || this.ball.mode === "shot" || this.ball.mode === "loose") {
      this.ball.x += this.ball.vx * dt;
      this.ball.y += this.ball.vy * dt;
      this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
      if (this.ball.trail.length > 26) this.ball.trail.shift();
    }

    if (this.ball.mode === "pass") {
      this.checkPassInterception();
      if (this.ball.mode !== "pass") return;
      if (dist(this.ball, { x: this.ball.targetX, y: this.ball.targetY }) < Math.max(1.2, this.ball.speed * dt)) {
        this.resolvePassArrival();
      }
    } else if (this.ball.mode === "shot") {
      this.trackGoalkeepersOnShot();
      this.checkShotResult();
    } else if (this.ball.mode === "loose") {
      this.ball.vx *= 1 - Math.min(dt * 2.3, 0.18);
      this.ball.vy *= 1 - Math.min(dt * 2.3, 0.18);
      this.updateReleaseIgnore(dt);
      this.resolveLooseBall(dt);
    }

    this.handleOutOfBounds();
  }

  resolveCarrierStall(dt) {
    const owner = this.ball.owner;
    if (this.ball.mode !== "owned" || !owner) {
      this.ball.carrierStallTimer = 0;
      this.ball.lastOwnerId = null;
      return;
    }

    const team = this.getTeam(owner.teamId);
    this.ball.goalLineActionCooldown = Math.max(0, this.ball.goalLineActionCooldown - dt);
    const moved = Math.hypot(owner.x - this.ball.lastOwnerX, owner.y - this.ball.lastOwnerY);
    const pressure = clamp((5.2 - this.nearestDistance(owner, this.getOpponents(team.id))) / 5.2, 0, 1);
    const nearGoalLine = this.isCarrierNearGoalLine(owner, team);
    const pinned = nearGoalLine && (moved < 0.035 || (pressure > 0.78 && moved < 0.09));

    if (this.ball.goalLineActionCooldown > 0) {
      this.ball.carrierStallTimer = Math.max(0, this.ball.carrierStallTimer - dt * 2.4);
    } else {
      this.ball.carrierStallTimer = pinned ? this.ball.carrierStallTimer + dt : Math.max(0, this.ball.carrierStallTimer - dt * 1.8);
    }
    this.ball.lastOwnerId = owner.id;
    this.ball.lastOwnerX = owner.x;
    this.ball.lastOwnerY = owner.y;

    if (this.ball.carrierStallTimer > 3.6) {
      this.ball.carrierStallTimer = 0;
      this.ball.goalLineActionCooldown = 5.2;
      this.forceGoalLineAction(owner, team, pressure);
    }
  }

  isCarrierNearGoalLine(player, team) {
    const attackingEnd = team.direction === 1 ? player.x > FIELD.width - 10 : player.x < 10;
    const ownEnd = team.direction === 1 ? player.x < 8 : player.x > FIELD.width - 8;
    return attackingEnd || ownEnd;
  }

  forceGoalLineAction(player, team, pressure) {
    if (this.ball.owner !== player || this.ball.mode !== "owned") return;
    const attackingEnd = team.direction === 1 ? player.x > FIELD.width - 10 : player.x < 10;
    if (attackingEnd) {
      const target = this.chooseCutbackTarget(player, team);
      if (target) {
        this.pass(player, target.player, team, target.score, {
          kind: "cutback",
          eventText: `${team.shortName} ${playerLabel(player)}倒三角传给${playerLabel(target.player)}`,
          lead: {
            x: clamp(target.player.x - team.direction * 1.4, 1.5, FIELD.width - 1.5),
            y: clamp(target.player.y + rand(-1.4, 1.4), 1.5, FIELD.height - 1.5),
          },
          qualityBonus: 0.02,
        });
        return;
      }
      this.sweepBallIntoBox(player, team);
      return;
    }

    const outlet = this.chooseClearanceTarget(player, team);
    if (outlet) {
      this.pass(player, outlet.player, team, outlet.score, {
        kind: "clearance",
        eventText: `${team.shortName} ${playerLabel(player)}把球解围给${playerLabel(outlet.player)}`,
        lead: {
          x: clamp(outlet.player.x + team.direction * 5, 1.5, FIELD.width - 1.5),
          y: clamp(outlet.player.y + rand(-2, 2), 1.5, FIELD.height - 1.5),
        },
        qualityBonus: -0.08 + pressure * 0.04,
      });
      return;
    }
    this.clearBallLong(player, team);
  }

  chooseCutbackTarget(player, team) {
    const opponents = this.getOpponents(team.id);
    const candidates = team.players
      .filter((teammate) => teammate !== player && teammate.role !== "GK")
      .map((teammate) => {
        const distance = dist(player, teammate);
        const cutbackDepth = team.direction * (player.x - teammate.x);
        const centrality = 1 - clamp(Math.abs(teammate.y - CENTER_Y) / 30, 0, 1);
        const boxEdge = clamp((24 - Math.abs(cutbackDepth - 14)) / 24, 0, 1);
        const laneSafety = this.passLaneSafety(player, teammate, opponents);
        const roleBonus = teammate.role === "ST" ? 20 : teammate.role === "AM" ? 24 : teammate.role === "CM" ? 14 : teammate.role === "W" ? 8 : 0;
        const score =
          teammate.attributes.shooting * 0.24 +
          teammate.attributes.passing * 0.16 +
          centrality * 32 +
          boxEdge * 26 +
          laneSafety * 22 +
          roleBonus -
          Math.abs(distance - 18) * 1.1 +
          rand(-8, 10);
        return { player: teammate, score, distance, cutbackDepth };
      })
      .filter((item) => item.distance > 5 && item.distance < 38 && item.cutbackDepth > 3)
      .sort((a, b) => b.score - a.score);
    return candidates[0] ?? null;
  }

  chooseClearanceTarget(player, team) {
    const opponents = this.getOpponents(team.id);
    const candidates = team.players
      .filter((teammate) => teammate !== player && teammate.role !== "GK")
      .map((teammate) => {
        const distance = dist(player, teammate);
        const upfield = team.direction * (teammate.x - player.x);
        const laneSafety = this.passLaneSafety(player, teammate, opponents);
        const score = upfield * 2.2 + laneSafety * 30 + teammate.attributes.speed * 0.16 - Math.abs(distance - 28) + rand(-8, 8);
        return { player: teammate, score, distance, upfield };
      })
      .filter((item) => item.distance > 9 && item.distance < 48 && item.upfield > 6)
      .sort((a, b) => b.score - a.score);
    return candidates[0] ?? null;
  }

  sweepBallIntoBox(player, team) {
    const goalX = team.direction === 1 ? FIELD.width : 0;
    const target = {
      x: clamp(goalX - team.direction * rand(7, 14), 1.5, FIELD.width - 1.5),
      y: clamp(CENTER_Y + rand(-FIELD.goalWidth * 0.42, FIELD.goalWidth * 0.42), GOAL_TOP - 2, GOAL_BOTTOM + 2),
    };
    const direction = normalize(target.x - player.x, target.y - player.y);
    const speed = rand(14, 21);
    this.ball.mode = "loose";
    this.ball.owner = null;
    this.ball.targetPlayer = null;
    this.ball.teamId = team.id;
    this.ball.passKind = null;
    this.ball.restartKind = null;
    this.ball.vx = direction.x * speed;
    this.ball.vy = direction.y * speed;
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;
    this.ball.trail = [{ x: player.x, y: player.y }];
    this.ignoreRecentRelease(player, 0.75);
    this.eventText = `${team.shortName} ${playerLabel(player)}把球扫向门前`;
    this.emitUpdate();
  }

  clearBallLong(player, team) {
    const direction = normalize(team.direction * rand(8, 14), rand(-4, 4));
    const speed = rand(18, 27);
    this.ball.mode = "loose";
    this.ball.owner = null;
    this.ball.targetPlayer = null;
    this.ball.teamId = team.id;
    this.ball.passKind = null;
    this.ball.restartKind = null;
    this.ball.vx = direction.x * speed;
    this.ball.vy = direction.y * speed;
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;
    this.ball.trail = [{ x: player.x, y: player.y }];
    this.ignoreRecentRelease(player, 0.8);
    this.eventText = `${team.shortName} ${playerLabel(player)}大脚解围`;
    this.emitUpdate();
  }

  goalkeeperLongKick(player, team, eventText) {
    const target = {
      x: clamp(player.x + team.direction * rand(38, 62), 8, FIELD.width - 8),
      y: clamp(CENTER_Y + rand(-21, 21), 6, FIELD.height - 6),
    };
    const direction = normalize(target.x - player.x, target.y - player.y);
    const speed = rand(22, 30);
    this.ball.mode = "loose";
    this.ball.owner = null;
    this.ball.targetPlayer = null;
    this.ball.teamId = team.id;
    this.ball.passKind = null;
    this.ball.restartKind = null;
    this.ball.vx = direction.x * speed;
    this.ball.vy = direction.y * speed;
    this.ball.speed = speed;
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;
    this.ball.trail = [{ x: player.x, y: player.y }];
    this.ignoreRecentRelease(player, 0.9);
    player.decisionTimer = rand(0.9, 1.4);
    this.eventText = eventText;
    this.emitUpdate();
  }

  checkPassInterception() {
    const receivingTeam = this.getTeam(this.ball.teamId);
    const opponents = this.getOpponents(receivingTeam.id);
    for (const opponent of opponents) {
      if (opponent.tackleTimer > 0) continue;
      const d = dist(opponent, this.ball);
      if (d < 2.2) {
        if (this.tryBlockCrossForCorner(opponent, d)) return;
        const interceptChance = clamp((opponent.attributes.defense / 100) * (1 - d / 2.4) * (1 - this.ball.quality * 0.45), 0.06, 0.74);
        opponent.tackleTimer = rand(0.4, 1.1);
        if (chance(interceptChance)) {
          this.takePossession(opponent, `${this.getTeam(opponent.teamId).shortName} ${playerLabel(opponent)}抄截成功`);
          this.emitUpdate();
          return;
        }
      }
    }
  }

  resolvePassArrival() {
    const receiver = this.ball.targetPlayer;
    if (!receiver) {
      this.makeBallLoose();
      return;
    }

    const receivingDistance = dist(receiver, this.ball);
    const opponents = this.getOpponents(receiver.teamId);
    const pressure = clamp((5 - this.nearestDistance(receiver, opponents)) / 5, 0, 1);
    const controlChance = clamp(receiver.attributes.dribbling / 100 + this.ball.quality * 0.28 - pressure * 0.22, 0.28, 0.96);

    if (receivingDistance < 5.4 && chance(controlChance)) {
      this.takePossession(receiver, `${this.getTeam(receiver.teamId).shortName} ${playerLabel(receiver)}接球`);
      this.emitUpdate();
    } else {
      this.makeBallLoose(`${this.getTeam(receiver.teamId).shortName} ${playerLabel(receiver)}停球稍大`);
    }
  }

  tryBlockCrossForCorner(defender, distanceToBall) {
    if (this.ball.passKind !== "cross" || !this.ball.targetPlayer) return false;
    const attackingTeam = this.getTeam(this.ball.teamId);
    const defendingTeam = this.getTeam(defender.teamId);
    if (!attackingTeam || !defendingTeam || attackingTeam.id === defendingTeam.id) return false;
    const attackingProgress = attackingTeam.direction * (this.ball.x - FIELD.width / 2);
    if (attackingProgress < 16) return false;
    const blockChance = clamp(
      RESTART_EVENTS.blockedCrossCornerChance *
        (1 - distanceToBall / 2.4) *
        (defender.attributes.defense / 92) *
        (this.restartStats.corners === 0 && this.clock > this.matchSeconds * RESTART_EVENTS.cornerCatchupAfter ? 1.7 : 1),
      0,
      0.62,
    );
    if (!chance(blockChance)) return false;
    defender.tackleTimer = rand(0.5, 1.1);
    this.referee.whistleTimer = 0.75;
    return this.scheduleForcedCorner(
      attackingTeam,
      this.ball,
      `${defendingTeam.shortName} ${playerLabel(defender)}封堵传中，${attackingTeam.shortName} 获得角球`,
    );
  }

  trackGoalkeepersOnShot() {
    const defendingTeam = this.teams.find((team) => team.id !== this.ball.shotTeamId);
    const keeper = defendingTeam.players.find((player) => player.role === "GK");
    if (!keeper) return;
    const ownGoalX = defendingTeam.direction === 1 ? 0 : FIELD.width;
    keeper.targetX = ownGoalX + defendingTeam.direction * 3.4;
    keeper.targetY = clamp(this.ball.targetY, GOAL_TOP - 3, GOAL_BOTTOM + 3);
  }

  checkShotResult() {
    if (this.ball.x >= FIELD.width || this.ball.x <= 0) {
      const scoringSide = this.ball.x >= FIELD.width ? 1 : -1;
      const attackingTeam = this.getTeam(this.ball.shotTeamId);
      const validGoalLine = attackingTeam.direction === scoringSide;
      const onTarget = this.ball.y >= GOAL_TOP && this.ball.y <= GOAL_BOTTOM;

      if (validGoalLine && onTarget) {
        this.resolveKeeperSave(attackingTeam);
      } else {
        this.scheduleGoalLineRestart();
      }
    }
  }

  resolveKeeperSave(attackingTeam) {
    const defendingTeam = this.teams.find((team) => team.id !== attackingTeam.id);
    const keeper = defendingTeam.players.find((player) => player.role === "GK");
    const savePoint = { x: attackingTeam.direction === 1 ? FIELD.width : 0, y: this.ball.y };
    const keeperDistance = dist(keeper, savePoint);
    let saveChance = clamp(
      keeper.attributes.keeping / 88 +
        (3.8 - keeperDistance) * 0.12 -
        this.ball.quality * 0.28 +
        rand(-0.04, 0.1),
      0.38,
      0.9,
    );
    if (this.ball.restartKind === "penalty") {
      saveChance = clamp(keeper.attributes.keeping / 170 + (2.8 - keeperDistance) * 0.05 - this.ball.quality * 0.18 + rand(-0.03, 0.08), 0.16, 0.52);
    } else if (this.ball.restartKind === "freeKick") {
      saveChance = clamp(saveChance - 0.08, 0.3, 0.82);
    }

    if (chance(saveChance)) {
      keeper.x = clamp(savePoint.x - attackingTeam.direction * 2.3, 1, FIELD.width - 1);
      keeper.y = clamp(savePoint.y, GOAL_TOP - 3, GOAL_BOTTOM + 3);
      if (chance(0.68)) {
        const saveText =
          this.ball.restartKind === "penalty"
            ? `${defendingTeam.shortName} ${playerLabel(keeper)}扑出点球`
            : `${defendingTeam.shortName} ${playerLabel(keeper)}扑救成功`;
        this.takePossession(keeper, saveText);
      } else {
        this.ball.teamId = defendingTeam.id;
        const blockText =
          this.ball.restartKind === "penalty"
            ? `${defendingTeam.shortName} ${playerLabel(keeper)}把点球挡出`
            : `${defendingTeam.shortName} ${playerLabel(keeper)}把球挡出`;
        this.makeBallLoose(blockText);
        this.ball.x = keeper.x + defendingTeam.direction * 4.5;
        this.ball.y = keeper.y + rand(-4, 4);
      }
      this.emitUpdate();
      return;
    }

    attackingTeam.score += 1;
    this.state = "goalPause";
    this.pauseTimer = MATCH.goalPauseSeconds;
    this.phaseText = "进球";
    const finishText =
      this.ball.restartKind === "penalty"
        ? "罚进点球"
        : this.ball.restartKind === "freeKick"
          ? "任意球破门"
          : "破门";
    this.eventText = `${attackingTeam.shortName} ${playerLabel(this.ball.shotPlayer)}${finishText}，比分 ${this.teams[0].score}:${this.teams[1].score}`;
    this.ball.mode = "loose";
    this.ball.owner = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.emitUpdate();
  }

  ignoreRecentRelease(player, duration = 0.65) {
    this.ball.releaseIgnorePlayerId = player.id;
    this.ball.releaseIgnoreTimer = duration;
  }

  updateReleaseIgnore(dt) {
    if (!this.ball.releaseIgnorePlayerId) return;
    this.ball.releaseIgnoreTimer = Math.max(0, this.ball.releaseIgnoreTimer - dt);
    if (this.ball.releaseIgnoreTimer <= 0) this.ball.releaseIgnorePlayerId = null;
  }

  resolveLooseBall(dt) {
    const ignoredPlayerId = this.ball.releaseIgnoreTimer > 0 ? this.ball.releaseIgnorePlayerId : null;
    const contenders = this.players
      .filter((player) => player.id !== ignoredPlayerId)
      .map((player) => ({ player, distance: dist(player, this.ball) }))
      .sort((a, b) => a.distance - b.distance);
    const nearest = contenders[0];
    if (!nearest) return;

    const ballTravel = Math.hypot(this.ball.x - this.ball.lastX, this.ball.y - this.ball.lastY);
    const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    const nearEnough = contenders.filter((item) => item.distance < 4.4);
    const hasOpposedChallenge = nearEnough.some((item) => item.player.teamId !== nearest.player.teamId);

    this.ball.looseTimer += dt;
    if (ballTravel < 0.05 && ballSpeed < 0.55 && nearest.distance < 4.7) {
      this.ball.stallTimer += dt;
    } else {
      this.ball.stallTimer = Math.max(0, this.ball.stallTimer - dt * 0.7);
    }
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;

    if (nearest.distance < 3.1 && (!hasOpposedChallenge || chance(0.32 + nearest.player.attributes.dribbling / 260))) {
      this.takePossession(nearest.player, `${this.getTeam(nearest.player.teamId).shortName} ${playerLabel(nearest.player)}拿到二点球`);
      this.emitUpdate();
      return;
    }

    if (nearEnough.length >= 2 && (this.ball.stallTimer > 0.45 || this.ball.looseTimer > 1.15)) {
      this.resolveContestedLooseBall(nearEnough);
    } else if (this.ball.stallTimer > 1.2 && nearest.distance < 6.5) {
      this.takePossession(nearest.player, `${this.getTeam(nearest.player.teamId).shortName} ${playerLabel(nearest.player)}控制住乱球`);
      this.emitUpdate();
    }
  }

  resolveContestedLooseBall(contenders) {
    const weighted = contenders.slice(0, 5).map((item) => {
      const attributes = item.player.attributes;
      const distanceScore = Math.max(0, 4.8 - item.distance) * 20;
      const roleScore = item.player.role === "GK" ? 3 : 0;
      const score =
        distanceScore +
        attributes.speed * 0.18 +
        attributes.dribbling * 0.26 +
        attributes.defense * 0.22 +
        roleScore +
        rand(-8, 10);
      return { ...item, score: Math.max(1, score) };
    });
    const winner = pickWeighted(weighted);
    if (!winner) return;

    const opposingPressure = contenders
      .filter((item) => item.player.teamId !== winner.player.teamId)
      .some((item) => item.distance < 3.8);

    if (opposingPressure && chance(0.28)) {
      this.pokeBallFree(winner.player);
      return;
    }

    this.takePossession(winner.player, `${this.getTeam(winner.player.teamId).shortName} ${playerLabel(winner.player)}拼下球权`);
    this.emitUpdate();
  }

  pokeBallFree(player) {
    const team = this.getTeam(player.teamId);
    const lane = player.y < CENTER_Y ? 1 : -1;
    const direction = normalize(team.direction * rand(4, 8), lane * rand(2.5, 7));
    const speed = rand(7, 12);
    this.ball.mode = "loose";
    this.ball.owner = null;
    this.ball.targetPlayer = null;
    this.ball.teamId = player.teamId;
    this.ball.passKind = null;
    this.ball.restartKind = null;
    this.ball.vx = direction.x * speed;
    this.ball.vy = direction.y * speed;
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;
    this.ignoreRecentRelease(player, 0.55);
    this.eventText = `${this.getTeam(player.teamId).shortName} ${playerLabel(player)}把球捅向空当`;
    this.emitUpdate();
  }

  makeBallLoose(eventText = null) {
    this.ball.mode = "loose";
    this.ball.owner = null;
    this.ball.targetPlayer = null;
    this.ball.passKind = null;
    this.ball.restartKind = null;
    this.ball.vx *= 0.34;
    this.ball.vy *= 0.34;
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;
    if (eventText) this.eventText = eventText;
    this.emitUpdate();
  }

  handleOutOfBounds() {
    if (this.ball.mode === "owned") return;
    const outBySide = this.ball.y < -1 || this.ball.y > FIELD.height + 1;
    const outByEnd = this.ball.x < -1 || this.ball.x > FIELD.width + 1;
    if (outByEnd) {
      this.scheduleGoalLineRestart();
      return;
    }
    if (outBySide) {
      this.scheduleThrowInRestart();
    }
  }

  scheduleThrowInRestart() {
    if (this.state === "restartPause") return;
    const side = this.ball.y < 0 ? -1 : 1;
    const lastTeam = this.getTeam(this.ball.teamId);
    const restartTeam = this.teams.find((team) => team.id !== lastTeam?.id) ?? this.teams[0];
    const restartPoint = {
      x: clamp(this.ball.x, 4, FIELD.width - 4),
      y: side < 0 ? 0.8 : FIELD.height - 0.8,
    };
    const taker = this.nearestPlayer(restartPoint, restartTeam.players.filter((player) => player.role !== "GK"));
    if (!taker) return;
    this.scheduleRestart({
      type: "throwIn",
      team: restartTeam,
      taker,
      point: restartPoint,
      side,
      pause: 0.75,
      phaseText: "边线球",
      eventText: `${restartTeam.shortName} 获得边线球`,
    });
  }

  scheduleForcedThrowIn(restartTeam, point, side, eventText) {
    if (this.state === "restartPause" || !restartTeam) return false;
    const restartPoint = {
      x: clamp(point.x, 4, FIELD.width - 4),
      y: side < 0 ? 0.8 : FIELD.height - 0.8,
    };
    const taker = this.nearestPlayer(restartPoint, restartTeam.players.filter((player) => player.role !== "GK"));
    if (!taker) return false;
    this.scheduleRestart({
      type: "throwIn",
      team: restartTeam,
      taker,
      point: restartPoint,
      side,
      pause: 0.75,
      phaseText: "边线球",
      eventText,
    });
    return true;
  }

  scheduleGoalLineRestart() {
    if (this.state === "restartPause") return;
    const exitSide = this.ball.x >= FIELD.width ? 1 : -1;
    const defendingTeam = this.teams.find((team) => team.direction === -exitSide);
    const attackingTeam = this.teams.find((team) => team.direction === exitSide);
    const lastTeam = this.getTeam(this.ball.teamId);
    const isCorner = lastTeam?.id === defendingTeam?.id;
    const restartTeam = isCorner ? attackingTeam : defendingTeam;
    if (!restartTeam) return;

    const cornerY = this.ball.y < CENTER_Y ? 0.8 : FIELD.height - 0.8;
    const restartPoint = isCorner
      ? { x: exitSide === 1 ? FIELD.width - 0.8 : 0.8, y: cornerY }
      : { x: exitSide === 1 ? FIELD.width - FIELD.goalAreaDepth : FIELD.goalAreaDepth, y: CENTER_Y };
    const taker = isCorner
      ? this.nearestPlayer(restartPoint, restartTeam.players.filter((player) => player.role !== "GK")) ?? restartTeam.players[0]
      : restartTeam.players.find((player) => player.role === "GK") ?? restartTeam.players[0];

    this.scheduleRestart({
      type: isCorner ? "corner" : "goalKick",
      team: restartTeam,
      taker,
      point: restartPoint,
      exitSide,
      pause: isCorner ? 1.15 : 0.9,
      phaseText: isCorner ? "角球" : "门球",
      eventText: isCorner ? `${restartTeam.shortName} 获得角球` : `${restartTeam.shortName} 获得门球`,
    });
  }

  scheduleForcedCorner(restartTeam, point, eventText) {
    if (this.state === "restartPause" || !restartTeam) return false;
    const exitSide = restartTeam.direction;
    const restartPoint = {
      x: exitSide === 1 ? FIELD.width - 0.8 : 0.8,
      y: point.y < CENTER_Y ? 0.8 : FIELD.height - 0.8,
    };
    const taker = this.nearestPlayer(restartPoint, restartTeam.players.filter((player) => player.role !== "GK")) ?? restartTeam.players[0];
    if (!taker) return false;
    this.scheduleRestart({
      type: "corner",
      team: restartTeam,
      taker,
      point: restartPoint,
      exitSide,
      pause: 1.15,
      phaseText: "角球",
      eventText,
    });
    return true;
  }

  scheduleRestart({ type, team, taker, point, pause, phaseText, eventText, exitSide = 0, side = 0, direct = false, foulPoint = null }) {
    if (type === "corner") this.restartStats.corners += 1;
    else if (type === "throwIn") this.restartStats.throwIns += 1;
    else if (type === "goalKick") this.restartStats.goalKicks += 1;
    this.state = "restartPause";
    this.pauseTimer = pause;
    this.restartContext = {
      type,
      teamId: team.id,
      takerId: taker.id,
      point,
      exitSide,
      side,
      direct,
      foulPoint,
    };
    this.ball.mode = "loose";
    this.ball.owner = null;
    this.ball.targetPlayer = null;
    this.ball.shotPlayer = null;
    this.ball.passKind = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.speed = 0;
    this.ball.restartKind = null;
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    this.ball.teamId = team.id;
    this.ball.x = clamp(point.x, 0.4, FIELD.width - 0.4);
    this.ball.y = clamp(point.y, 0.4, FIELD.height - 0.4);
    this.ball.targetX = this.ball.x;
    this.ball.targetY = this.ball.y;
    this.ball.trail = [];
    this.phaseText = phaseText;
    this.eventText = eventText;
    this.emitUpdate();
  }

  completeRestart() {
    const context = this.restartContext;
    if (!context) {
      this.state = "playing";
      return;
    }
    const team = this.getTeam(context.teamId);
    const taker = this.players.find((player) => player.id === context.takerId) ?? team.players[0];
    taker.x = context.point.x;
    taker.y = context.point.y;
    taker.targetX = context.point.x;
    taker.targetY = context.point.y;
    this.ball.x = context.point.x;
    this.ball.y = context.point.y;
    this.state = "playing";
    this.restartContext = null;

    if (context.type === "corner") {
      this.executeCornerKick(taker, team, context);
      return;
    }
    if (context.type === "goalKick") {
      this.executeGoalKick(taker, team);
      return;
    }
    if (context.type === "throwIn") {
      this.executeThrowIn(taker, team, context);
      return;
    }
    if (context.type === "penalty") {
      this.executePenaltyKick(taker, team);
      return;
    }
    this.executeFreeKick(taker, team, context);
  }

  executeFreeKick(taker, team, context) {
    if (context.direct && this.shouldShootFreeKick(taker, team)) {
      this.shoot(taker, team, 0.08, {
        directFreeKick: true,
        restartKind: "freeKick",
        accuracyBonus: 0.045,
        qualityBonus: 0.04,
        speedBonus: 1.4,
        eventText: `${team.shortName} ${playerLabel(taker)}直接任意球攻门`,
      });
      return;
    }

    const target = this.chooseRestartPassTarget(taker, team, context);
    if (target) {
      this.pass(taker, target.player, team, target.score, {
        kind: "freeKick",
        eventText: `${team.shortName} ${playerLabel(taker)}开出任意球给${playerLabel(target.player)}`,
        lead: {
          x: clamp(target.player.x + team.direction * 2.6, 1.5, FIELD.width - 1.5),
          y: clamp(target.player.y + rand(-1.2, 1.2), 1.5, FIELD.height - 1.5),
        },
        qualityBonus: 0.02,
      });
      return;
    }
    this.goalkeeperLongKick(taker, team, `${team.shortName} ${playerLabel(taker)}开出任意球`);
  }

  shouldShootFreeKick(taker, team) {
    const goalX = team.direction === 1 ? FIELD.width : 0;
    const distanceToGoal = Math.abs(goalX - taker.x);
    const centrality = 1 - clamp(Math.abs(taker.y - CENTER_Y) / 27, 0, 1);
    if (distanceToGoal > 31 || centrality < 0.34) return false;
    const shootingWeight = clamp((taker.attributes.shooting - 48) / 42, 0, 1);
    const rangeWeight = clamp((31 - distanceToGoal) / 17, 0, 1);
    return chance(0.14 + centrality * 0.22 + shootingWeight * 0.18 + rangeWeight * 0.16);
  }

  executePenaltyKick(taker, team) {
    this.shoot(taker, team, 0, {
      penalty: true,
      restartKind: "penalty",
      accuracyBonus: 0.22,
      qualityBonus: 0.16,
      speedBonus: 0.8,
      eventText: `${team.shortName} ${playerLabel(taker)}主罚点球`,
    });
  }

  executeGoalKick(taker, team) {
    const target = this.chooseGoalKickTarget(taker, team);
    if (target && chance(0.68)) {
      this.pass(taker, target.player, team, target.score, {
        kind: "goalKick",
        skipOffside: true,
        eventText: `${team.shortName} ${playerLabel(taker)}开出门球找${playerLabel(target.player)}`,
        lead: {
          x: clamp(target.player.x + team.direction * clamp(target.distance * 0.18, 2.4, 8), 1.5, FIELD.width - 1.5),
          y: clamp(target.player.y + rand(-2.2, 2.2), 1.5, FIELD.height - 1.5),
        },
        qualityBonus: target.distance > 34 ? -0.08 : 0.03,
      });
      return;
    }
    this.goalkeeperLongKick(taker, team, `${team.shortName} ${playerLabel(taker)}大脚开出门球`);
  }

  executeCornerKick(taker, team, context) {
    const target = this.chooseCornerTarget(taker, team, context);
    if (target) {
      this.pass(taker, target.player, team, target.score, {
        kind: "corner",
        skipOffside: true,
        eventText: `${team.shortName} ${playerLabel(taker)}开出角球找${playerLabel(target.player)}`,
        lead: {
          x: clamp(target.player.x + team.direction * rand(0.8, 2.2), 1.5, FIELD.width - 1.5),
          y: clamp(lerp(target.player.y, CENTER_Y, 0.38) + rand(-1.8, 1.8), 1.5, FIELD.height - 1.5),
        },
        qualityBonus: 0.04,
      });
      return;
    }
    this.sweepRestartBall(taker, team, `${team.shortName} ${playerLabel(taker)}开出角球，扫向门前`, context.exitSide);
  }

  executeThrowIn(taker, team, context) {
    const target = this.chooseThrowInTarget(taker, team, context);
    if (target) {
      this.pass(taker, target.player, team, target.score, {
        kind: "throwIn",
        skipOffside: true,
        eventText: `${team.shortName} ${playerLabel(taker)}掷出边线球给${playerLabel(target.player)}`,
        lead: {
          x: clamp(target.player.x + team.direction * 1.6, 1.5, FIELD.width - 1.5),
          y: clamp(target.player.y + rand(-1.1, 1.1), 1.5, FIELD.height - 1.5),
        },
        qualityBonus: -0.02,
      });
      return;
    }
    this.sweepRestartBall(taker, team, `${team.shortName} ${playerLabel(taker)}掷出边线球，掷向前场`, team.direction);
  }

  chooseGoalKickTarget(taker, team) {
    const opponents = this.getOpponents(team.id);
    const preferShort = chance(0.58);
    const candidates = team.players
      .filter((player) => player !== taker && player.role !== "GK")
      .map((player) => {
        const distance = dist(taker, player);
        const forwardGain = team.direction * (player.x - taker.x);
        const laneSafety = this.passLaneSafety(taker, player, opponents);
        const roleBonus = { CB: 20, FB: 22, DM: 19, CM: 14, W: preferShort ? 4 : 18, ST: preferShort ? 2 : 20, AM: 10 }[player.role] ?? 8;
        const distanceBias = preferShort ? Math.abs(distance - 22) : Math.abs(distance - 42);
        const score =
          taker.attributes.passing * 0.75 +
          roleBonus +
          forwardGain * 0.52 +
          laneSafety * 44 -
          distanceBias * 0.92 +
          rand(-7, 12);
        return { player, score, distance, forwardGain, laneSafety };
      })
      .filter((item) => item.distance > 10 && item.distance < 58 && item.forwardGain > -4 && item.laneSafety > 0.06)
      .sort((a, b) => b.score - a.score);
    return candidates[0] ?? null;
  }

  chooseCornerTarget(taker, team, context) {
    const goalX = context.exitSide === 1 ? FIELD.width : 0;
    const opponents = this.getOpponents(team.id);
    const candidates = team.players
      .filter((player) => player !== taker && player.role !== "GK")
      .map((player) => {
        const distance = dist(taker, player);
        const boxDepth = Math.abs(goalX - player.x);
        const centrality = 1 - clamp(Math.abs(player.y - CENTER_Y) / 28, 0, 1);
        const laneSafety = this.passLaneSafety(taker, player, opponents);
        const roleBonus = { ST: 28, CB: 20, AM: 18, W: 12, CM: 10, DM: 6, FB: 4 }[player.role] ?? 8;
        const score =
          player.attributes.shooting * 0.2 +
          player.attributes.speed * 0.12 +
          roleBonus +
          centrality * 26 +
          laneSafety * 22 -
          Math.abs(boxDepth - 9) * 1.5 -
          Math.abs(distance - 27) * 0.62 +
          rand(-8, 12);
        return { player, score, distance, boxDepth };
      })
      .filter((item) => item.distance > 9 && item.distance < 45 && item.boxDepth < 20)
      .sort((a, b) => b.score - a.score);
    return candidates[0] ?? null;
  }

  chooseThrowInTarget(taker, team, context) {
    const opponents = this.getOpponents(team.id);
    const sidelineY = context.side < 0 ? 0 : FIELD.height;
    const candidates = team.players
      .filter((player) => player !== taker && player.role !== "GK")
      .map((player) => {
        const distance = dist(taker, player);
        const forwardGain = team.direction * (player.x - taker.x);
        const laneSafety = this.passLaneSafety(taker, player, opponents);
        const infield = Math.abs(player.y - sidelineY);
        const roleBonus = player.role === "FB" || player.role === "W" ? 18 : player.role === "CM" || player.role === "DM" ? 12 : 6;
        const score =
          roleBonus +
          player.attributes.dribbling * 0.16 +
          forwardGain * 0.86 +
          laneSafety * 34 -
          Math.abs(distance - 12) * 1.2 -
          Math.abs(infield - 8) * 0.7 +
          rand(-8, 10);
        return { player, score, distance, laneSafety };
      })
      .filter((item) => item.distance > 3.5 && item.distance < 24 && item.laneSafety > 0.04)
      .sort((a, b) => b.score - a.score);
    return candidates[0] ?? null;
  }

  chooseRestartPassTarget(taker, team, context) {
    const opponents = this.getOpponents(team.id);
    const candidates = team.players
      .filter((player) => player !== taker && player.role !== "GK")
      .map((player) => {
        const distance = dist(taker, player);
        const forwardGain = team.direction * (player.x - taker.x);
        const laneSafety = this.passLaneSafety(taker, player, opponents);
        const score = player.attributes.passing * 0.22 + forwardGain * 1.1 + laneSafety * 44 - Math.abs(distance - 20) + rand(-6, 10);
        return { player, score, distance, laneSafety };
      })
      .filter((item) => item.distance > 6 && item.distance < 42 && item.laneSafety > 0.1)
      .sort((a, b) => b.score - a.score);
    return candidates[0] ?? null;
  }

  tryCommitFoul(defender, carrier, distance, tackleStrength, dt) {
    if (!FOULS.enabled || this.state !== "playing" || this.fouls?.cooldown > 0) return false;
    if (!defender || !carrier || defender.teamId === carrier.teamId) return false;
    const attackingTeam = this.getTeam(carrier.teamId);
    const defendingTeam = this.getTeam(defender.teamId);
    if (!attackingTeam || !defendingTeam) return false;
    const goalX = attackingTeam.direction === 1 ? FIELD.width : 0;
    const attackingDanger = clamp(1 - Math.abs(goalX - carrier.x) / FIELD.width, 0, 1);
    const lateChallenge = clamp(1 - tackleStrength, 0, 1);
    const closeContact = clamp((2.65 - distance) / 2.2, 0, 1);
    const foulPoint = {
      x: clamp(lerp(defender.x, carrier.x, 0.55), 2, FIELD.width - 2),
      y: clamp(lerp(defender.y, carrier.y, 0.55), 2, FIELD.height - 2),
    };
    const penaltyAreaCaution = this.isPenaltyFoul(foulPoint, defendingTeam, attackingTeam) ? FOULS.penaltyAreaChanceMultiplier : 1;
    const foulChance = clamp(
      FOULS.baseChance * closeContact * (0.65 + lateChallenge * 1.1 + attackingDanger * 0.8) * penaltyAreaCaution * dt * 8,
      0,
      FOULS.maxChancePerChallenge,
    );
    if (!chance(foulChance)) return false;
    if (this.fouls) {
      this.fouls.cooldown = Math.max(3.5, FOULS.cooldownSeconds + rand(-2, 3));
      this.fouls.count += 1;
    }
    this.callFoul(defender, carrier, { attackingDanger, lateChallenge, contactDistance: distance });
    return true;
  }

  callFoul(offender, fouledPlayer, context = {}) {
    const offenderTeam = this.getTeam(offender.teamId);
    const restartTeam = this.getTeam(fouledPlayer.teamId);
    if (!offenderTeam || !restartTeam) return;

    const foulPoint = {
      x: clamp(lerp(offender.x, fouledPlayer.x, 0.55), 2, FIELD.width - 2),
      y: clamp(lerp(offender.y, fouledPlayer.y, 0.55), 2, FIELD.height - 2),
    };
    const isPenalty = this.isPenaltyFoul(foulPoint, offenderTeam, restartTeam);
    if (isPenalty && this.fouls) this.fouls.penalties += 1;
    const denyingChance = context.attackingDanger > 0.76 && this.isCentralShootingLane(foulPoint);
    const redChance = clamp(
      FOULS.redCardChance + context.lateChallenge * 0.008 + (denyingChance ? 0.018 : 0) + (isPenalty ? 0.006 : 0),
      0,
      0.05,
    );
    const yellowChance = clamp(
      FOULS.yellowCardChance + context.lateChallenge * 0.08 + context.attackingDanger * 0.08 + (isPenalty ? 0.04 : 0),
      0.08,
      0.42,
    );
    let cardResult = { type: "none", text: "" };
    if (chance(redChance)) cardResult = this.issueCard(offender, "red");
    else if (chance(yellowChance)) cardResult = this.issueCard(offender, "yellow");

    this.referee.whistleTimer = Math.max(this.referee.whistleTimer, 1.25);
    this.referee.x = lerp(this.referee.x, foulPoint.x, 0.35);
    this.referee.y = lerp(this.referee.y, foulPoint.y, 0.35);

    if (isPenalty) {
      this.schedulePenaltyRestart(restartTeam, offenderTeam, offender, fouledPlayer, foulPoint, cardResult);
      return;
    }

    this.scheduleFreeKickRestart(restartTeam, offenderTeam, offender, fouledPlayer, foulPoint, cardResult);
  }

  isPenaltyFoul(point, defendingTeam, attackingTeam) {
    if (defendingTeam.id === attackingTeam.id) return false;
    const inY = point.y >= CENTER_Y - FIELD.penaltyWidth / 2 && point.y <= CENTER_Y + FIELD.penaltyWidth / 2;
    if (!inY) return false;
    return defendingTeam.direction === 1 ? point.x <= FIELD.penaltyDepth : point.x >= FIELD.width - FIELD.penaltyDepth;
  }

  isCentralShootingLane(point) {
    return Math.abs(point.y - CENTER_Y) < FIELD.goalWidth * 1.35;
  }

  scheduleFreeKickRestart(restartTeam, offenderTeam, offender, fouledPlayer, point, cardResult) {
    const taker =
      this.nearestPlayer(point, restartTeam.players.filter((player) => player.role !== "GK")) ??
      restartTeam.players.find((player) => player.role === "GK") ??
      restartTeam.players[0];
    if (!taker) return;
    const cardText = cardResult?.text ? `，${cardResult.text}` : "";
    const eventText = `${offenderTeam.shortName} ${playerLabel(offender)}犯规，${restartTeam.shortName} 获得任意球${cardText}`;
    this.scheduleRestart({
      type: "freeKick",
      team: restartTeam,
      taker,
      point,
      pause: 1.05,
      phaseText: "任意球",
      eventText,
      direct: true,
    });
    if (!cardResult?.text) this.showMatchNotice("freeKick", "任意球", `${restartTeam.shortName} ${playerLabel(fouledPlayer)}`, restartTeam.id, 2.3);
  }

  schedulePenaltyRestart(restartTeam, offenderTeam, offender, fouledPlayer, foulPoint, cardResult) {
    const point = {
      x: restartTeam.direction === 1 ? FIELD.width - 11 : 11,
      y: CENTER_Y,
    };
    const taker = this.pickPenaltyTaker(restartTeam) ?? restartTeam.players[0];
    if (!taker) return;
    const cardText = cardResult?.text ? `，${cardResult.text}` : "";
    this.scheduleRestart({
      type: "penalty",
      team: restartTeam,
      taker,
      point,
      pause: 1.65,
      phaseText: "点球",
      eventText: `${offenderTeam.shortName} ${playerLabel(offender)}禁区内犯规，${restartTeam.shortName} 获得点球${cardText}`,
      foulPoint,
    });
    if (!cardResult?.text) this.showMatchNotice("penalty", "点球", `${restartTeam.shortName} ${playerLabel(fouledPlayer)}`, restartTeam.id, 2.7);
  }

  pickPenaltyTaker(team) {
    return team.players
      .filter((player) => player.role !== "GK")
      .slice()
      .sort((a, b) => b.attributes.shooting + b.attributes.dribbling * 0.18 - (a.attributes.shooting + a.attributes.dribbling * 0.18))[0];
  }

  sweepRestartBall(taker, team, eventText, exitSide) {
    const goalX = exitSide === 1 ? FIELD.width : exitSide === -1 ? 0 : taker.x + team.direction * 34;
    const target = {
      x: clamp(goalX - Math.sign(exitSide || team.direction) * rand(7, 18), 1.5, FIELD.width - 1.5),
      y: clamp(CENTER_Y + rand(-FIELD.goalWidth * 0.58, FIELD.goalWidth * 0.58), 1.5, FIELD.height - 1.5),
    };
    const direction = normalize(target.x - taker.x, target.y - taker.y);
    const speed = rand(14, 22);
    this.ball.mode = "loose";
    this.ball.owner = null;
    this.ball.targetPlayer = null;
    this.ball.teamId = team.id;
    this.ball.passKind = null;
    this.ball.restartKind = null;
    this.ball.vx = direction.x * speed;
    this.ball.vy = direction.y * speed;
    this.ball.speed = speed;
    this.ball.looseTimer = 0;
    this.ball.stallTimer = 0;
    this.ball.lastX = this.ball.x;
    this.ball.lastY = this.ball.y;
    this.ball.trail = [{ x: taker.x, y: taker.y }];
    this.ignoreRecentRelease(taker, 0.85);
    this.eventText = eventText;
    this.emitUpdate();
  }

  checkPressure(dt) {
    if (!this.ball.owner || this.ball.mode !== "owned") return;
    const carrier = this.ball.owner;
    const team = this.getTeam(carrier.teamId);
    const opponents = this.getOpponents(team.id);
    const nearest = this.nearestPlayer(carrier, opponents.filter((player) => player.role !== "GK"));
    if (!nearest || nearest.tackleTimer > 0) return;

    const d = dist(carrier, nearest);
    if (d < 2.6) {
      const tackleStrength = nearest.attributes.defense / (nearest.attributes.defense + carrier.attributes.dribbling);
      if (this.tryTouchlineChallengeForThrowIn(carrier, nearest, dt)) return;
      if (this.tryCommitFoul(nearest, carrier, d, tackleStrength, dt)) return;
      const tackleChance = clamp((2.8 - d) * tackleStrength * dt * 0.62, 0, 0.42);
      nearest.tackleTimer = rand(0.18, 0.62);
      if (chance(tackleChance)) {
        if (chance(0.72)) {
          this.takePossession(nearest, `${this.getTeam(nearest.teamId).shortName} ${playerLabel(nearest)}抢断`);
        } else {
          this.makeBallLoose(`${this.getTeam(nearest.teamId).shortName} ${playerLabel(nearest)}把球捅开`);
          this.ball.x = lerp(carrier.x, nearest.x, 0.5);
          this.ball.y = lerp(carrier.y, nearest.y, 0.5);
        }
        this.emitUpdate();
      }
    }
  }

  checkRestartRhythmEvents(dt) {
    if (this.state !== "playing" || this.ball.mode !== "owned" || !this.ball.owner) return;
    const carrier = this.ball.owner;
    const team = this.getTeam(carrier.teamId);
    if (!team) return;
    const opponents = this.getOpponents(team.id);
    const nearest = this.nearestPlayer(carrier, opponents.filter((player) => player.role !== "GK"));

    if (this.restartStats.throwIns === 0 && this.clock > this.matchSeconds * RESTART_EVENTS.throwInCatchupAfter) {
      const forceThrow = this.clock > this.matchSeconds * 0.58;
      if (this.tryTouchlineChallengeForThrowIn(carrier, nearest, dt, { force: forceThrow })) return;
    }

    if (this.restartStats.corners === 0 && this.clock > this.matchSeconds * RESTART_EVENTS.cornerCatchupAfter) {
      const attackingProgress = team.direction * (carrier.x - FIELD.width / 2);
      const wideFactor = Math.abs(carrier.y - CENTER_Y) / CENTER_Y;
      const lateCatchup = this.clock > this.matchSeconds * 0.72;
      if (attackingProgress < 8 && !lateCatchup) return;
      const cornerChance = clamp(
        dt * (lateCatchup ? 0.9 : 0.26) * (0.65 + team.tactic.shape.width * 1.8) * (0.55 + wideFactor),
        0,
        0.55,
      );
      if (!chance(cornerChance)) return;
      const defendingTeam = this.teams.find((currentTeam) => currentTeam.id !== team.id);
      const defender = nearest ?? defendingTeam?.players.find((player) => player.role !== "GK");
      const blockText = defender
        ? `${defendingTeam.shortName} ${playerLabel(defender)}挡出传中，${team.shortName} 获得角球`
        : `${team.shortName} 边路传中被挡出，获得角球`;
      this.referee.whistleTimer = 0.75;
      this.scheduleForcedCorner(team, carrier, blockText);
      return;
    }

    if (team.tactic.id === "wingCross" && this.restartStats.corners < 4 && this.clock > this.matchSeconds * 0.2) {
      const attackingProgress = team.direction * (carrier.x - FIELD.width / 2);
      const wideFactor = Math.abs(carrier.y - CENTER_Y) / CENTER_Y;
      if (attackingProgress < 16 || wideFactor < 0.42) return;
      const extraCornerChance = clamp(dt * 0.18 * wideFactor * (0.85 + team.tactic.shape.width), 0, 0.28);
      if (!chance(extraCornerChance)) return;
      const defendingTeam = this.teams.find((currentTeam) => currentTeam.id !== team.id);
      const defender = nearest ?? defendingTeam?.players.find((player) => player.role !== "GK");
      this.referee.whistleTimer = 0.75;
      this.scheduleForcedCorner(
        team,
        carrier,
        defender
          ? `${defendingTeam.shortName} ${playerLabel(defender)}封堵下底传中，${team.shortName} 获得角球`
          : `${team.shortName} 下底传中被挡出，获得角球`,
      );
    }
  }

  tryTouchlineChallengeForThrowIn(carrier, defender, dt, options = {}) {
    const team = this.getTeam(carrier.teamId);
    const defendingTeam = defender ? this.getTeam(defender.teamId) : this.teams.find((currentTeam) => currentTeam.id !== team?.id);
    if (!team || !defendingTeam || defendingTeam.id === team.id) return false;
    const sideDistance = Math.min(carrier.y, FIELD.height - carrier.y);
    const nearTouchline = sideDistance < 14;
    if (!nearTouchline && !options.force) return false;
    const catchupBoost = this.restartStats.throwIns === 0 && this.clock > this.matchSeconds * RESTART_EVENTS.throwInCatchupAfter ? 1.8 : 1;
    const widthFactor = 0.55 + team.tactic.shape.width * 1.55;
    const forceFactor = options.force ? 3.2 : 1;
    const throwChance = clamp(dt * RESTART_EVENTS.touchlineChallengeChance * widthFactor * catchupBoost * forceFactor, 0, 0.42);
    if (!chance(throwChance)) return false;

    const side = carrier.y < CENTER_Y ? -1 : 1;
    const defenderLastTouch = defender && chance(options.force ? 0.72 : 0.64);
    const restartTeam = defenderLastTouch ? team : defendingTeam;
    const eventText = defenderLastTouch
      ? `${defendingTeam.shortName} ${playerLabel(defender)}封堵出边线，${restartTeam.shortName} 获得边线球`
      : `${team.shortName} ${playerLabel(carrier)}贴边趟大，${restartTeam.shortName} 获得边线球`;
    this.referee.whistleTimer = 0.65;
    return this.scheduleForcedThrowIn(restartTeam, carrier, side, eventText);
  }

  setRestingTargets() {
    for (const player of this.players) {
      player.targetX = player.anchor.x;
      player.targetY = player.anchor.y;
      if (player.role === "GK") this.constrainGoalkeeper(player);
    }
  }

  setRestartTargets() {
    const context = this.restartContext;
    if (!context) {
      this.setRestingTargets();
      return;
    }
    const restartTeam = this.getTeam(context.teamId);
    const defendingTeam = this.teams.find((team) => team.id !== context.teamId);
    for (const player of this.players) {
      if (player.id === context.takerId) {
        player.targetX = context.point.x;
        player.targetY = context.point.y;
        continue;
      }
      if (context.type === "corner") {
        const isRestartTeam = player.teamId === restartTeam.id;
        const goalX = context.exitSide === 1 ? FIELD.width : 0;
        const nearPostY = context.point.y < CENTER_Y ? GOAL_TOP + 2 : GOAL_BOTTOM - 2;
        const farPostY = context.point.y < CENTER_Y ? GOAL_BOTTOM - 2 : GOAL_TOP + 2;
        if (isRestartTeam) {
          const attackerIndex = player.order % 5;
          player.targetX = clamp(goalX - context.exitSide * (5 + attackerIndex * 2.2), 3, FIELD.width - 3);
          player.targetY = clamp(lerp(nearPostY, farPostY, (attackerIndex % 5) / 4), 5, FIELD.height - 5);
        } else {
          player.targetX = clamp(goalX - context.exitSide * (4 + (player.order % 4) * 2), 3, FIELD.width - 3);
          player.targetY = clamp(lerp(GOAL_TOP - 2, GOAL_BOTTOM + 2, (player.order % 6) / 5), 4, FIELD.height - 4);
        }
      } else if (context.type === "throwIn") {
        const isRestartTeam = player.teamId === restartTeam.id;
        const sideY = context.side < 0 ? 0 : FIELD.height;
        const infield = context.side < 0 ? 1 : -1;
        const laneStep = (player.order % 5) * 3.4;
        if (isRestartTeam) {
          player.targetX = clamp(context.point.x + restartTeam.direction * (4 + (player.order % 4) * 4.2), 4, FIELD.width - 4);
          player.targetY = clamp(sideY + infield * (5.5 + laneStep), 4, FIELD.height - 4);
        } else {
          player.targetX = clamp(context.point.x + restartTeam.direction * (2 + (player.order % 3) * 3.2), 4, FIELD.width - 4);
          player.targetY = clamp(sideY + infield * (6.5 + laneStep * 0.92), 4, FIELD.height - 4);
        }
      } else if (context.type === "goalKick") {
        const hasRestart = player.teamId === restartTeam.id;
        const ownGoalX = restartTeam.direction === 1 ? 0 : FIELD.width;
        if (hasRestart) {
          if (player.role === "CB" || player.role === "FB") {
            player.targetX = clamp(ownGoalX + restartTeam.direction * (18 + (player.order % 3) * 5), 4, FIELD.width - 4);
            player.targetY = clamp(player.anchor.y, 6, FIELD.height - 6);
          } else {
            const spread = this.getBaseTarget(player, restartTeam, true, context.point, this.getOpponents(restartTeam.id));
            player.targetX = clamp(spread.x + restartTeam.direction * 2, 4, FIELD.width - 4);
            player.targetY = spread.y;
          }
        } else {
          const pressLine = ownGoalX + restartTeam.direction * 46;
          player.targetX = clamp(pressLine + restartTeam.direction * ((player.order % 4) * 3.2), 4, FIELD.width - 4);
          player.targetY = clamp(player.anchor.y, 5, FIELD.height - 5);
        }
      } else if (context.type === "penalty") {
        const hasRestart = player.teamId === restartTeam.id;
        const goalX = restartTeam.direction === 1 ? FIELD.width : 0;
        const defendingGoalkeeper = !hasRestart && player.role === "GK";
        if (defendingGoalkeeper) {
          player.targetX = clamp(goalX - restartTeam.direction * 1.1, 1.5, FIELD.width - 1.5);
          player.targetY = CENTER_Y;
        } else if (hasRestart) {
          player.targetX = clamp(context.point.x - restartTeam.direction * (9 + (player.order % 5) * 1.8), 4, FIELD.width - 4);
          player.targetY = clamp(CENTER_Y + ((player.order % 2 === 0 ? -1 : 1) * (8 + (player.order % 4) * 4)), 6, FIELD.height - 6);
        } else {
          player.targetX = clamp(context.point.x - restartTeam.direction * (11 + (player.order % 5) * 1.7), 4, FIELD.width - 4);
          player.targetY = clamp(CENTER_Y + ((player.order % 2 === 0 ? 1 : -1) * (9 + (player.order % 4) * 3.5)), 6, FIELD.height - 6);
        }
      } else {
        const hasRestart = player.teamId === restartTeam.id;
        const spread = this.getBaseTarget(player, this.getTeam(player.teamId), hasRestart, context.point, this.getOpponents(player.teamId));
        player.targetX = hasRestart ? spread.x : lerp(spread.x, FIELD.width / 2, 0.22);
        player.targetY = spread.y;
      }
      if (player.role === "GK") this.constrainGoalkeeper(player);
    }
  }

  updatePhaseText() {
    if (this.state !== "playing") return;
    const owner = this.ball.owner;
    if (!owner) {
      this.phaseText = this.ball.mode === "shot" ? "射门" : "争夺球权";
      return;
    }

    const team = this.getTeam(owner.teamId);
    const goalX = team.direction === 1 ? FIELD.width : 0;
    const distanceToGoal = Math.abs(goalX - owner.x);
    if (distanceToGoal < 28) this.phaseText = `${team.shortName} ${team.tactic.name}：前场进攻`;
    else if (distanceToGoal > 64) this.phaseText = `${team.shortName} ${team.tactic.name}：后场组织`;
    else this.phaseText = `${team.shortName} ${team.tactic.name}：中场推进`;
  }

  getSnapshot() {
    return {
      field: FIELD,
      teams: this.teams,
      players: this.players,
      ball: this.ball,
      clock: this.clock,
      round: this.round,
      state: this.state,
      phaseText: this.phaseText,
      eventText: this.eventText,
      lastResult: this.lastResult,
      matchSeconds: this.matchSeconds,
      referee: this.referee,
      notice: this.matchNotice,
      offsideCount: this.offside?.count ?? 0,
    };
  }

  emitUpdate() {
    this.dispatchEvent(new CustomEvent("match-event", { detail: this.getSnapshot() }));
  }

  getTeam(teamId) {
    return this.teams.find((team) => team.id === teamId);
  }

  getOpponents(teamId) {
    return this.teams.find((team) => team.id !== teamId).players;
  }

  nearestPlayer(point, players) {
    return players.reduce((best, player) => {
      if (!best) return player;
      return dist(point, player) < dist(point, best) ? player : best;
    }, null);
  }

  nearestDistance(point, players) {
    const nearest = this.nearestPlayer(point, players);
    return nearest ? dist(point, nearest) : 99;
  }
}

function normalize(x, y) {
  const length = Math.hypot(x, y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

function distanceToSegment(point, a, b) {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const wx = point.x - a.x;
  const wy = point.y - a.y;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(point.x - b.x, point.y - b.y);
  const t = c1 / c2;
  return Math.hypot(point.x - (a.x + t * vx), point.y - (a.y + t * vy));
}

function playerLabel(player) {
  if (!player) return "球员";
  return `${player.name ?? "球员"}（${player.number}号）`;
}

function roleGroup(role) {
  if (role === "GK") return "keeper";
  if (role === "CB" || role === "FB") return "defense";
  if (role === "DM" || role === "CM" || role === "AM") return "midfield";
  return "attack";
}

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.score, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.score;
    if (roll <= 0) return item;
  }
  return items[items.length - 1] ?? null;
}
