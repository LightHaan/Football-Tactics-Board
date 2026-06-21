import { FIELD, PLAYER_RENDERING } from "./data.js?v=31";

const GOAL_TOP = FIELD.height / 2 - FIELD.goalWidth / 2;
const GOAL_BOTTOM = FIELD.height / 2 + FIELD.goalWidth / 2;

export class FootballRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.bounds = { x: 0, y: 0, width: 1, height: 1, scale: 1 };
    window.addEventListener("resize", () => this.resize());
    this.resize();
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
    this.drawBallTrail(ctx, snapshot.ball);
    this.drawPlayers(ctx, snapshot.players);
    this.drawReferee(ctx, snapshot.referee);
    this.drawBall(ctx, snapshot.ball);
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

  drawPlayers(ctx, players) {
    const sorted = [...players].sort((a, b) => a.y - b.y);
    for (const player of sorted) {
      if (PLAYER_RENDERING.mode === "stickman") {
        this.drawPlayerStickman(ctx, player);
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

  drawPlayerStickman(ctx, player) {
    const p = this.toScreen(player.x, player.y);
    const scale = this.bounds.scale;
    const speed = Math.hypot(player.vx, player.vy);
    const moving = speed > 0.12;
    const facing = this.getPlayerFacing(player);
    const stepPhase = moving ? performance.now() * 0.01 + player.order * 0.7 : player.order * 0.7;
    const stride = Math.sin(stepPhase) * (moving ? 1 : 0.16);
    const counterStride = Math.sin(stepPhase + Math.PI) * (moving ? 1 : 0.16);
    const lean = moving ? clamp(speed / 7, 0, 1) * 0.22 : 0;
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

  drawBall(ctx, ball) {
    const p = this.getBallScreenPosition(ball);
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

  getBallScreenPosition(ball) {
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
