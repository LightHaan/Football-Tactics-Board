import { FIELD, PLAYER_RENDERING } from "./data.js?v=39";

const GOAL_TOP = FIELD.height / 2 - FIELD.goalWidth / 2;
const GOAL_BOTTOM = FIELD.height / 2 + FIELD.goalWidth / 2;

export class FootballRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.bounds = { x: 0, y: 0, width: 1, height: 1, scale: 1 };
    this.tacticGuideMode = "off";
    window.addEventListener("resize", () => this.resize());
    this.resize();
  }

  setTacticGuideMode(mode) {
    this.tacticGuideMode = ["implicit", "explicit"].includes(mode) ? mode : "off";
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = Math.floor(width * this.pixelRatio);
    this.canvas.height = Math.floor(height * this.pixelRatio);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    this.computeBounds(width, height);
  }

  computeBounds(width, height) {
    const topInset = width < 680 ? 236 : 148;
    const bottomInset = width < 680 ? 126 : 104;
    const availableWidth = Math.max(320, width - 40);
    const availableHeight = Math.max(220, height - topInset - bottomInset);
    const scale = Math.min(availableWidth / FIELD.width, availableHeight / FIELD.height);
    const pitchWidth = FIELD.width * scale;
    const pitchHeight = FIELD.height * scale;
    this.bounds = {
      x: (width - pitchWidth) / 2,
      y: topInset + (availableHeight - pitchHeight) / 2,
      width: pitchWidth,
      height: pitchHeight,
      scale,
    };
  }

  draw(snapshot) {
    const ctx = this.ctx;
    const { width, height } = this.canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    this.drawAmbientBackground(ctx, width, height);
    this.drawPitch(ctx);
    this.drawTacticGuides(ctx, snapshot);
    if (this.tacticGuideMode !== "off") this.drawBallTrail(ctx, snapshot.ball);
    this.drawPlayers(ctx, snapshot);
    this.drawReferee(ctx, snapshot.referee);
    this.drawBall(ctx, snapshot);
  }

  drawAmbientBackground(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#155f38");
    gradient.addColorStop(0.46, "#1b7b46");
    gradient.addColorStop(1, "#114c34");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#fff7d0";
    ctx.lineWidth = 1;
    for (let x = -20; x < width + 80; x += 58) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 80, height);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPitch(ctx) {
    const b = this.bounds;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(b.scale, b.scale);

    ctx.fillStyle = "#247b49";
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    for (let i = 0; i < 10; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
      ctx.fillRect((FIELD.width / 10) * i, 0, FIELD.width / 10, FIELD.height);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 0.75;
    ctx.strokeRect(0, 0, FIELD.width, FIELD.height);
    this.drawHalfway(ctx);
    this.drawPenaltyAreas(ctx);
    this.drawGoals(ctx);

    ctx.restore();
  }

  drawHalfway(ctx) {
    ctx.beginPath();
    ctx.moveTo(FIELD.width / 2, 0);
    ctx.lineTo(FIELD.width / 2, FIELD.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(FIELD.width / 2, FIELD.height / 2, 9.15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(FIELD.width / 2, FIELD.height / 2, 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPenaltyAreas(ctx) {
    const penaltyY = (FIELD.height - FIELD.penaltyWidth) / 2;
    const goalAreaY = (FIELD.height - FIELD.goalAreaWidth) / 2;

    ctx.strokeRect(0, penaltyY, FIELD.penaltyDepth, FIELD.penaltyWidth);
    ctx.strokeRect(FIELD.width - FIELD.penaltyDepth, penaltyY, FIELD.penaltyDepth, FIELD.penaltyWidth);
    ctx.strokeRect(0, goalAreaY, FIELD.goalAreaDepth, FIELD.goalAreaWidth);
    ctx.strokeRect(FIELD.width - FIELD.goalAreaDepth, goalAreaY, FIELD.goalAreaDepth, FIELD.goalAreaWidth);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(11, FIELD.height / 2, 0.35, 0, Math.PI * 2);
    ctx.arc(FIELD.width - 11, FIELD.height / 2, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGoals(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-2, GOAL_TOP, 2, FIELD.goalWidth);
    ctx.strokeRect(FIELD.width, GOAL_TOP, 2, FIELD.goalWidth);
    ctx.restore();
  }

  drawTacticGuides(ctx, snapshot) {
    if (this.tacticGuideMode === "off") return;
    if (!snapshot || snapshot.state === "preMatch" || snapshot.state === "fullTime") return;

    const ball = snapshot.ball;
    const teamId = ball.owner?.teamId ?? ball.teamId ?? ball.shotTeamId;
    const team = snapshot.teams.find((currentTeam) => currentTeam.id === teamId);
    if (!team) return;

    const owner = ball.owner?.teamId === team.id ? ball.owner : null;
    const players = snapshot.players.filter((player) => player.teamId === team.id && player.role !== "GK");
    const pulse = 0.82 + Math.sin(performance.now() * 0.012) * 0.18;

    this.drawGuideSupportLanes(ctx, team, players, owner, pulse);
    for (const route of this.getGuideRunRoutes(team, players, ball, owner)) {
      this.drawGuideArrow(ctx, route.from, route.to, {
        color: rgbaFromColor(route.player.color, route.alpha * pulse),
        width: route.isOwner ? 2.6 : 1.7,
        headSize: route.isOwner ? 1.35 : 1,
        dash: route.isOwner ? [] : [7, 8],
        targetDot: route.isOwner || this.tacticGuideMode === "explicit",
      });
    }
    this.drawCommittedBallRoute(ctx, ball, team, owner, pulse);
  }

  getGuideRunRoutes(team, players, ball, owner) {
    const ballPoint = { x: ball.x, y: ball.y };
    const targetPlayerId = ball.targetPlayer?.id ?? "";
    const explicit = this.tacticGuideMode === "explicit";
    const roleBonus = { ST: 10, W: 8, AM: 7, CM: 4, FB: 3, DM: 2, CB: 1 };

    return players
      .map((player) => {
        const target = {
          x: player.targetX ?? player.x,
          y: player.targetY ?? player.y,
        };
        const distance = fieldDistance(player, target);
        const targetAdvance = (team.direction ?? 1) * (target.x - player.x);
        const nearBall = Math.max(0, 26 - fieldDistance(player, ballPoint));
        const isOwner = owner?.id === player.id;
        const isTarget = targetPlayerId === player.id;
        const score =
          distance * 2.3 +
          clamp(targetAdvance, -4, 16) * 0.9 +
          nearBall * 0.22 +
          (roleBonus[player.role] ?? 0) +
          (isOwner ? 22 : 0) +
          (isTarget ? 18 : 0);
        return {
          player,
          from: { x: player.x, y: player.y },
          to: target,
          distance,
          score,
          isOwner,
          isTarget,
          alpha: isOwner ? 0.76 : explicit ? 0.58 : 0.46,
        };
      })
      .filter((route) => route.distance > 1.15)
      .filter((route) => {
        if (explicit) return true;
        return route.isOwner || route.isTarget || fieldDistance(route.player, ballPoint) < 22 || route.score > 24;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, explicit ? 9 : 4);
  }

  drawGuideSupportLanes(ctx, team, players, owner, pulse) {
    if (this.tacticGuideMode !== "explicit" || !owner) return;
    const tacticId = team.tactic?.id ?? "balanced";
    const roleBias = {
      wingCross: { W: 18, FB: 12, ST: 8, AM: 5, CM: 2 },
      centralPenetration: { ST: 16, AM: 14, CM: 10, W: 4, FB: 1 },
      balanced: { ST: 11, AM: 9, W: 8, CM: 7, FB: 4 },
    }[tacticId] ?? { ST: 10, AM: 8, W: 8, CM: 6, FB: 4 };

    const lanes = players
      .filter((player) => player.id !== owner.id)
      .map((player) => {
        const target = {
          x: player.targetX ?? player.x,
          y: player.targetY ?? player.y,
        };
        const distance = fieldDistance(owner, target);
        const forwardGain = (team.direction ?? 1) * (target.x - owner.x);
        const width = Math.abs(target.y - FIELD.height / 2) / (FIELD.height / 2);
        const centrality = 1 - width;
        const tacticShape =
          tacticId === "wingCross"
            ? width * 18
            : tacticId === "centralPenetration"
              ? centrality * 18
              : 8;
        return {
          player,
          target,
          distance,
          score:
            forwardGain * 1.35 +
            (roleBias[player.role] ?? 0) +
            tacticShape -
            Math.abs(distance - 23) * 0.65 +
            clamp(player.attributes?.passing ?? 58, 35, 90) * 0.08,
        };
      })
      .filter((lane) => lane.distance > 7 && lane.distance < 48)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    for (const lane of lanes) {
      this.drawGuideArrow(ctx, { x: owner.x, y: owner.y }, lane.target, {
        color: `rgba(255,255,255,${0.26 * pulse})`,
        width: 1.25,
        dash: [4, 10],
        headSize: 0.82,
        targetDot: false,
      });
    }
  }

  drawCommittedBallRoute(ctx, ball, team, owner, pulse) {
    if (ball.mode === "pass" && ball.teamId === team.id && ball.targetPlayer) {
      const start = ball.trail?.[0] ?? { x: ball.lastX, y: ball.lastY };
      const routeColor =
        ball.passKind === "cross" || ball.passKind === "corner"
          ? `rgba(125,211,252,${0.82 * pulse})`
          : `rgba(255,238,148,${0.86 * pulse})`;
      this.drawGuideArrow(ctx, start, { x: ball.targetX, y: ball.targetY }, {
        color: routeColor,
        width: 2.8,
        headSize: 1.45,
        targetDot: true,
      });
      return;
    }

    if (ball.mode === "shot" && ball.shotTeamId === team.id) {
      const start = ball.trail?.[0] ?? ball.shotPlayer ?? { x: ball.lastX, y: ball.lastY };
      this.drawGuideArrow(ctx, start, { x: ball.targetX, y: ball.targetY }, {
        color: `rgba(255,171,84,${0.9 * pulse})`,
        width: 3,
        headSize: 1.55,
        targetDot: true,
      });
      return;
    }

    if (ball.mode === "owned" && owner) {
      this.drawGuideArrow(ctx, { x: owner.x, y: owner.y }, { x: owner.targetX, y: owner.targetY }, {
        color: `rgba(255,255,255,${0.42 * pulse})`,
        width: 1.7,
        dash: [6, 7],
        headSize: 0.95,
        targetDot: false,
      });
    }
  }

  drawGuideArrow(ctx, fromField, toField, options = {}) {
    const from = this.toScreen(fromField.x, fromField.y);
    const to = this.toScreen(toField.x, toField.y);
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    if (length < 7) return;

    const direction = normalize(to.x - from.x, to.y - from.y);
    const side = perpendicular(direction);
    const headSize = clamp(this.bounds.scale * 1.75 * (options.headSize ?? 1), 7, 15);
    const lineEnd = {
      x: to.x - direction.x * headSize * 0.56,
      y: to.y - direction.y * headSize * 0.56,
    };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = options.color ?? "rgba(255,255,255,0.42)";
    ctx.fillStyle = options.color ?? "rgba(255,255,255,0.42)";
    const lineWidth = clamp(this.bounds.scale * (options.width ?? 1.6), 1.1, 4.2);
    ctx.lineWidth = lineWidth + 2.4;
    ctx.strokeStyle = "rgba(6,12,9,0.3)";
    ctx.setLineDash(options.dash ?? []);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();

    ctx.strokeStyle = options.color ?? "rgba(255,255,255,0.42)";
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - direction.x * headSize + side.x * headSize * 0.42, to.y - direction.y * headSize + side.y * headSize * 0.42);
    ctx.lineTo(to.x - direction.x * headSize - side.x * headSize * 0.42, to.y - direction.y * headSize - side.y * headSize * 0.42);
    ctx.closePath();
    ctx.fillStyle = "rgba(6,12,9,0.3)";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - direction.x * headSize + side.x * headSize * 0.42, to.y - direction.y * headSize + side.y * headSize * 0.42);
    ctx.lineTo(to.x - direction.x * headSize - side.x * headSize * 0.42, to.y - direction.y * headSize - side.y * headSize * 0.42);
    ctx.closePath();
    ctx.fillStyle = options.color ?? "rgba(255,255,255,0.42)";
    ctx.fill();

    if (options.targetDot) {
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = "rgba(6,12,9,0.36)";
      ctx.beginPath();
      ctx.arc(to.x, to.y, clamp(headSize * 0.42, 4.2, 7.2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = options.color ?? "rgba(255,255,255,0.42)";
      ctx.beginPath();
      ctx.arc(to.x, to.y, clamp(headSize * 0.38, 3.4, 6.4), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBallTrail(ctx, ball) {
    if (!ball.trail || ball.trail.length < 2) return;
    ctx.save();
    ctx.strokeStyle = ball.mode === "shot" ? "rgba(255,238,148,0.8)" : "rgba(255,255,255,0.54)";
    ctx.lineWidth = Math.max(1, this.bounds.scale * 0.22);
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ball.trail.forEach((point, index) => {
      const p = this.toScreen(point.x, point.y);
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  drawPlayers(ctx, snapshot) {
    const sorted = [...snapshot.players].sort((a, b) => a.y - b.y);
    for (const player of sorted) {
      if (PLAYER_RENDERING.mode === "stickman") {
        this.drawPlayerStickman(ctx, player, snapshot);
      } else {
        this.drawPlayerCircle(ctx, player);
      }
    }
  }

  drawPlayerCircle(ctx, player) {
    const p = this.toScreen(player.x, player.y);
    const radius = clamp(this.bounds.scale * 1.35, 8, 16);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 9;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y + radius * 0.5, radius * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = player.trim;
    ctx.stroke();

    if (player.role === "GK") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 0.62, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,230,92,0.95)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = player.trim;
    ctx.font = `800 ${Math.max(9, radius * 0.86)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(player.number), p.x, p.y + 0.4);

    const target = this.toScreen(player.targetX, player.targetY);
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = player.trim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(
      p.x + clamp(target.x - p.x, -radius * 1.3, radius * 1.3),
      p.y + clamp(target.y - p.y, -radius * 1.3, radius * 1.3),
    );
    ctx.stroke();
    ctx.restore();
  }

  drawPlayerStickman(ctx, player, snapshot) {
    const p = this.toScreen(player.x, player.y);
    const scale = this.bounds.scale;
    const speed = Math.hypot(player.vx, player.vy);
    const moving = speed > 0.12;
    const pose = this.getPlayerPose(player, snapshot);
    if (pose.type === "slide") {
      this.drawSlidingStickman(ctx, player, pose);
      return;
    }
    if (pose.type === "save") {
      this.drawGoalkeeperDive(ctx, player, snapshot);
      return;
    }
    const facing = this.getPlayerFacing(player);
    const stepPhase = moving ? performance.now() * 0.01 + player.order * 0.7 : player.order * 0.7;
    const stridePower = pose.type === "sprint" ? 1.38 : pose.type === "dribble" ? 1.12 : 1;
    const stride = Math.sin(stepPhase) * (moving ? stridePower : 0.16);
    const counterStride = Math.sin(stepPhase + Math.PI) * (moving ? stridePower : 0.16);
    const lean = moving ? clamp(speed / 7, 0, 1) * (pose.type === "sprint" ? 0.36 : 0.22) : 0;
    const headRadius = this.getPlayerHeadRadius();
    const torso = headRadius * 1.25;
    const leg = headRadius * 1.45;
    const height = headRadius * 3.9;
    const stroke = clamp(scale * 0.42, 2.2, 4.1);
    const head = {
      x: p.x,
      y: p.y,
    };
    const shoulder = {
      x: p.x + facing.x * lean * headRadius * 0.45,
      y: p.y + headRadius * 1.22,
    };
    const hip = {
      x: shoulder.x - facing.x * lean * headRadius * 0.24,
      y: shoulder.y + torso,
    };
    const groundY = hip.y + leg;

    const side = perpendicular(facing);
    const frontFoot = {
      x: hip.x + facing.x * stride * height * 0.18 + side.x * 0.8,
      y: groundY,
    };
    const backFoot = {
      x: hip.x + facing.x * counterStride * height * 0.18 - side.x * 0.8,
      y: groundY,
    };
    const frontKnee = {
      x: lerp(hip.x, frontFoot.x, 0.48) - facing.x * Math.abs(counterStride) * height * 0.05,
      y: lerp(hip.y, frontFoot.y, 0.5) - Math.abs(stride) * height * 0.06,
    };
    const backKnee = {
      x: lerp(hip.x, backFoot.x, 0.48) + facing.x * Math.abs(stride) * height * 0.05,
      y: lerp(hip.y, backFoot.y, 0.5) - Math.abs(counterStride) * height * 0.06,
    };
    const leftHand = {
      x: shoulder.x + facing.x * counterStride * height * 0.14 + side.x * height * 0.08,
      y: shoulder.y + torso * 0.72,
    };
    const rightHand = {
      x: shoulder.x + facing.x * stride * height * 0.14 - side.x * height * 0.08,
      y: shoulder.y + torso * 0.72,
    };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(p.x, groundY + 2, height * 0.27, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = stroke + 2.2;
    this.drawStickLimb(ctx, hip, frontKnee, frontFoot);
    this.drawStickLimb(ctx, hip, backKnee, backFoot);
    this.drawStickLine(ctx, head, shoulder);
    this.drawStickLine(ctx, hip, shoulder);
    this.drawStickLine(ctx, shoulder, leftHand);
    this.drawStickLine(ctx, shoulder, rightHand);

    ctx.strokeStyle = player.color;
    ctx.lineWidth = stroke;
    this.drawStickLimb(ctx, hip, frontKnee, frontFoot);
    this.drawStickLimb(ctx, hip, backKnee, backFoot);
    this.drawStickLine(ctx, shoulder, leftHand);
    this.drawStickLine(ctx, shoulder, rightHand);

    ctx.strokeStyle = player.trim;
    ctx.lineWidth = stroke + 1.2;
    this.drawStickLine(ctx, head, shoulder);
    this.drawStickLine(ctx, hip, shoulder);

    ctx.fillStyle = player.color;
    ctx.strokeStyle = player.trim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(head.x, head.y, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (player.role === "GK") {
      ctx.strokeStyle = "rgba(255,230,92,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(head.x, head.y, headRadius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (PLAYER_RENDERING.showNumbers) {
      ctx.fillStyle = player.trim;
      ctx.font = `800 ${Math.max(9, headRadius * 0.86)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(player.number), head.x, head.y + 0.4);
    }

    this.drawPoseAccent(ctx, player, snapshot, pose, {
      head,
      shoulder,
      hip,
      groundY,
      headRadius,
      stroke,
      facing,
      side,
      height,
    });

    ctx.restore();
  }

  getPlayerPose(player, snapshot) {
    const ball = snapshot.ball;
    const restart = snapshot.restartContext;
    const speed = Math.hypot(player.vx, player.vy);

    if (restart?.type === "throwIn" && restart.takerId === player.id) return { type: "throwIn" };
    if (ball.mode === "shot" && ball.shotPlayer?.id === player.id) return { type: "shot" };
    if (this.isHeaderContest(player, ball)) return { type: "header" };
    if (player.role === "GK" && ball.mode === "shot" && ball.teamId !== player.teamId && fieldDistance(player, ball) < 16) {
      return { type: "save" };
    }
    if (player.tackleTimer > 0.34 && ball.owner?.teamId && ball.owner.teamId !== player.teamId && fieldDistance(player, ball.owner) < 5.4) {
      return { type: "slide" };
    }
    if (ball.mode === "owned" && ball.owner?.id === player.id) return { type: "dribble" };
    if (speed > 5.4) return { type: "sprint" };
    return { type: "run" };
  }

  isHeaderContest(player, ball) {
    if (ball.mode !== "pass" || ball.targetPlayer?.id !== player.id) return false;
    if (ball.passKind !== "cross" && ball.passKind !== "corner") return false;
    return fieldDistance(player, ball) < 8.5;
  }

  drawSlidingStickman(ctx, player, pose) {
    const p = this.toScreen(player.x, player.y);
    const headRadius = this.getPlayerHeadRadius();
    const facing = this.getPlayerFacing(player);
    const side = perpendicular(facing);
    const length = headRadius * 4.6;
    const stroke = clamp(this.bounds.scale * 0.46, 2.3, 4.2);
    const shoulder = {
      x: p.x - facing.x * headRadius * 0.8,
      y: p.y + headRadius * 2.1,
    };
    const hip = {
      x: p.x + facing.x * headRadius * 0.55,
      y: p.y + headRadius * 2.55,
    };
    const head = {
      x: shoulder.x - facing.x * headRadius * 0.95,
      y: shoulder.y - headRadius * 0.52,
    };
    const leadFoot = {
      x: hip.x + facing.x * length * 0.72,
      y: hip.y + side.y * headRadius * 0.16,
    };
    const trailFoot = {
      x: hip.x - facing.x * length * 0.18 - side.x * headRadius * 0.6,
      y: hip.y + headRadius * 0.8,
    };
    const hand = {
      x: shoulder.x + facing.x * headRadius * 0.5 + side.x * headRadius * 0.7,
      y: shoulder.y + headRadius * 0.85,
    };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(hip.x, hip.y + headRadius * 1.15, length * 0.5, headRadius * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = stroke + 2.1;
    this.drawStickLine(ctx, shoulder, hip);
    this.drawStickLine(ctx, hip, leadFoot);
    this.drawStickLine(ctx, hip, trailFoot);
    this.drawStickLine(ctx, shoulder, hand);

    ctx.strokeStyle = player.color;
    ctx.lineWidth = stroke;
    this.drawStickLine(ctx, shoulder, hip);
    this.drawStickLine(ctx, hip, leadFoot);
    this.drawStickLine(ctx, hip, trailFoot);
    this.drawStickLine(ctx, shoulder, hand);

    ctx.fillStyle = player.color;
    ctx.strokeStyle = player.trim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(head.x, head.y, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawGoalkeeperDive(ctx, player, snapshot) {
    const p = this.toScreen(player.x, player.y);
    const ballPoint = this.toScreen(snapshot.ball.x, snapshot.ball.y);
    const dive = normalize(ballPoint.x - p.x, ballPoint.y - p.y);
    const side = perpendicular(dive);
    const headRadius = this.getPlayerHeadRadius();
    const stroke = clamp(this.bounds.scale * 0.46, 2.4, 4.4);
    const hip = { x: p.x - dive.x * headRadius * 0.4, y: p.y + headRadius * 2.45 };
    const shoulder = { x: hip.x + dive.x * headRadius * 1.25, y: hip.y - headRadius * 0.78 };
    const head = { x: shoulder.x + dive.x * headRadius * 0.8, y: shoulder.y - headRadius * 0.72 };
    const gloveA = { x: head.x + dive.x * headRadius * 2.0 + side.x * headRadius * 0.5, y: head.y + dive.y * headRadius * 2.0 + side.y * headRadius * 0.5 };
    const gloveB = { x: head.x + dive.x * headRadius * 1.8 - side.x * headRadius * 0.45, y: head.y + dive.y * headRadius * 1.8 - side.y * headRadius * 0.45 };
    const footA = { x: hip.x - dive.x * headRadius * 1.4 + side.x * headRadius * 0.9, y: hip.y - dive.y * headRadius * 1.4 + side.y * headRadius * 0.9 };
    const footB = { x: hip.x - dive.x * headRadius * 1.1 - side.x * headRadius * 0.8, y: hip.y - dive.y * headRadius * 1.1 - side.y * headRadius * 0.8 };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(hip.x, hip.y + headRadius * 1.2, headRadius * 2.3, headRadius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = player.color;
    ctx.lineWidth = stroke;
    this.drawStickLine(ctx, shoulder, hip);
    this.drawStickLine(ctx, shoulder, gloveA);
    this.drawStickLine(ctx, shoulder, gloveB);
    this.drawStickLine(ctx, hip, footA);
    this.drawStickLine(ctx, hip, footB);

    ctx.strokeStyle = "rgba(255,230,92,0.95)";
    ctx.lineWidth = stroke + 0.8;
    this.drawStickLine(ctx, shoulder, gloveA);
    this.drawStickLine(ctx, shoulder, gloveB);

    ctx.fillStyle = player.color;
    ctx.strokeStyle = player.trim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(head.x, head.y, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawPoseAccent(ctx, player, snapshot, pose, points) {
    const { head, shoulder, hip, groundY, headRadius, stroke, facing, side, height } = points;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = player.color;
    ctx.lineWidth = stroke;

    if (pose.type === "shot") {
      const target = this.toScreen(snapshot.ball.targetX, snapshot.ball.targetY);
      const kick = normalize(target.x - hip.x, target.y - hip.y);
      const knee = {
        x: hip.x + kick.x * height * 0.32,
        y: hip.y + height * 0.28,
      };
      const foot = {
        x: hip.x + kick.x * height * 0.58,
        y: groundY - headRadius * 0.18,
      };
      this.drawStickLimb(ctx, hip, knee, foot);
    } else if (pose.type === "throwIn") {
      const leftElbow = {
        x: shoulder.x + side.x * height * 0.12,
        y: shoulder.y - height * 0.18,
      };
      const rightElbow = {
        x: shoulder.x - side.x * height * 0.12,
        y: shoulder.y - height * 0.18,
      };
      const leftHand = {
        x: head.x + side.x * headRadius * 0.8,
        y: head.y - headRadius * 1.35,
      };
      const rightHand = {
        x: head.x - side.x * headRadius * 0.8,
        y: head.y - headRadius * 1.35,
      };
      this.drawStickLimb(ctx, shoulder, leftElbow, leftHand);
      this.drawStickLimb(ctx, shoulder, rightElbow, rightHand);
    } else if (pose.type === "header") {
      const jump = Math.sin(performance.now() * 0.018 + player.order) * headRadius * 0.14;
      const leftHand = {
        x: shoulder.x + side.x * height * 0.2,
        y: shoulder.y - height * 0.12 + jump,
      };
      const rightHand = {
        x: shoulder.x - side.x * height * 0.2,
        y: shoulder.y - height * 0.12 - jump,
      };
      this.drawStickLine(ctx, shoulder, leftHand);
      this.drawStickLine(ctx, shoulder, rightHand);
    } else if (pose.type === "dribble") {
      const touchFoot = {
        x: hip.x + facing.x * height * 0.22,
        y: groundY - headRadius * 0.12,
      };
      this.drawStickLine(ctx, hip, touchFoot);
    }
    ctx.restore();
  }

  drawStickLine(ctx, from, to) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  drawStickLimb(ctx, from, bend, to) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(bend.x, bend.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  drawReferee(ctx, referee) {
    if (!referee) return;
    const p = this.toScreen(referee.x, referee.y);
    const radius = clamp(this.bounds.scale * 1.05, 7, 12);
    const body = radius * 1.65;
    const leg = radius * 1.3;
    const stride = Math.sin(performance.now() * 0.011) * clamp(Math.hypot(referee.vx, referee.vy) / 8, 0.12, 1);
    const groundY = p.y + radius + body + leg;
    const shoulder = { x: p.x, y: p.y + radius * 1.25 };
    const hip = { x: p.x, y: shoulder.y + body };
    const leftFoot = { x: p.x - radius * 0.65 * stride, y: groundY };
    const rightFoot = { x: p.x + radius * 0.65 * stride, y: groundY };
    const leftHand = { x: p.x - radius * 0.95, y: shoulder.y + radius * 0.95 };
    const rightHand = { x: p.x + radius * 0.95, y: shoulder.y + radius * 0.95 };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(p.x, groundY + 2, radius * 1.7, radius * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#111417";
    ctx.lineWidth = clamp(this.bounds.scale * 0.42, 2.2, 4);
    this.drawStickLine(ctx, { x: p.x, y: p.y + radius }, shoulder);
    this.drawStickLine(ctx, shoulder, hip);
    this.drawStickLine(ctx, shoulder, leftHand);
    this.drawStickLine(ctx, shoulder, rightHand);
    this.drawStickLine(ctx, hip, leftFoot);
    this.drawStickLine(ctx, hip, rightFoot);

    ctx.fillStyle = "#111417";
    ctx.strokeStyle = "#f7f6ef";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f7f6ef";
    ctx.font = `800 ${Math.max(6, radius * 0.72)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("R", p.x, p.y + 0.3);

    if (referee.whistleTimer > 0) {
      const pulse = 0.7 + Math.sin(performance.now() * 0.028) * 0.3;
      ctx.strokeStyle = `rgba(255,255,255,${0.52 + pulse * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x + radius * 1.6, p.y - radius * 0.35, radius * 0.75, -0.8, 0.9);
      ctx.arc(p.x + radius * 1.9, p.y - radius * 0.35, radius * 1.12, -0.8, 0.9);
      ctx.stroke();
    }

    if (referee.cardFlashTimer > 0) {
      const cardX = rightHand.x + radius * 0.4;
      const cardY = rightHand.y - radius * 1.45;
      const cardColor = referee.cardColor ?? "#ffd532";
      ctx.fillStyle = cardColor;
      ctx.strokeStyle = cardColor === "#e93636" ? "#3a0505" : "#2b2100";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(cardX, cardY, radius * 0.72, radius * 1.05);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  getPlayerFacing(player) {
    let x = player.vx;
    let y = player.vy;
    if (Math.hypot(x, y) < 0.12) {
      x = player.targetX - player.x;
      y = player.targetY - player.y;
    }
    const direction = normalize(x, y);
    return direction.x || direction.y ? direction : { x: 1, y: 0 };
  }

  getPlayerHeadRadius() {
    return clamp(this.bounds.scale * 1.35, 8, 16);
  }

  drawBall(ctx, snapshot) {
    const p = this.getBallScreenPosition(snapshot);
    const radius = clamp(this.bounds.scale * 0.55, 4, 7);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.42)";
    ctx.shadowBlur = 9;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fffaf1";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#1d2420";
    ctx.stroke();
    ctx.restore();
  }

  getBallScreenPosition(snapshot) {
    const { ball, restartContext, players } = snapshot;
    if (restartContext?.type === "throwIn" && PLAYER_RENDERING.mode === "stickman") {
      const taker = players.find((player) => player.id === restartContext.takerId);
      if (taker) {
        const head = this.toScreen(taker.x, taker.y);
        const headRadius = this.getPlayerHeadRadius();
        return {
          x: head.x,
          y: head.y - headRadius * 1.55,
        };
      }
    }
    if (PLAYER_RENDERING.mode === "stickman" && ball.mode === "pass" && ball.targetPlayer && this.isHeaderContest(ball.targetPlayer, ball)) {
      const head = this.toScreen(ball.targetPlayer.x, ball.targetPlayer.y);
      const headRadius = this.getPlayerHeadRadius();
      return {
        x: head.x,
        y: head.y - headRadius * 0.92,
      };
    }
    if (ball.mode === "owned" && ball.owner && PLAYER_RENDERING.mode === "stickman") {
      const owner = ball.owner;
      const head = this.toScreen(owner.x, owner.y);
      const facing = this.getPlayerFacing(owner);
      const headRadius = this.getPlayerHeadRadius();
      const footY = head.y + headRadius * 3.92;
      const footX = head.x + facing.x * headRadius * 0.58;
      return {
        x: footX,
        y: footY - headRadius * 0.16,
      };
    }
    return this.toScreen(ball.x, ball.y);
  }

  toScreen(x, y) {
    return {
      x: this.bounds.x + x * this.bounds.scale,
      y: this.bounds.y + y * this.bounds.scale,
    };
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function normalize(x, y) {
  const length = Math.hypot(x, y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

function perpendicular(vector) {
  return { x: -vector.y, y: vector.x };
}

function fieldDistance(a, b) {
  if (!a || !b) return Infinity;
  return Math.hypot((a.x ?? 0) - (b.x ?? 0), (a.y ?? 0) - (b.y ?? 0));
}

function rgbaFromColor(color, alpha) {
  const safeAlpha = clamp(alpha, 0, 1);
  const hex = String(color ?? "").trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!match) return `rgba(255,255,255,${safeAlpha})`;

  const value =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : match[1];
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${safeAlpha})`;
}
