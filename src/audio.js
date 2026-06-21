export class MatchAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = true;
    this.unlocked = false;
    this.lastType = "";
    this.lastPlayedAt = 0;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.master) this.master.gain.value = enabled ? 0.18 : 0;
  }

  async unlock() {
    if (!this.enabled) return;
    this.ensureContext();
    if (this.context?.state === "suspended") await this.context.resume();
    this.unlocked = true;
  }

  playForEvent(eventText) {
    if (!this.enabled || !this.unlocked || !eventText) return;
    const type = classifyEvent(eventText);
    if (!type) return;

    const now = this.context.currentTime;
    if (type === this.lastType && now - this.lastPlayedAt < 0.18) return;
    this.lastType = type;
    this.lastPlayedAt = now;

    if (type === "pass") this.playTouch();
    else if (type === "shot") this.playShot();
    else if (type === "tackle") this.playTackle();
    else if (type === "save") this.playSave();
    else if (type === "goal") this.playGoal();
    else if (type === "whistle") this.playWhistle();
  }

  ensureContext() {
    if (this.context) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = this.enabled ? 0.18 : 0;
    this.master.connect(this.context.destination);
  }

  playTouch() {
    this.tone({ frequency: 620, type: "triangle", attack: 0.002, decay: 0.045, gain: 0.38 });
  }

  playShot() {
    this.tone({ frequency: 128, type: "sawtooth", attack: 0.002, decay: 0.12, gain: 0.6 });
    this.noise({ attack: 0.001, decay: 0.055, gain: 0.3, filterFrequency: 520 });
  }

  playTackle() {
    this.tone({ frequency: 92, type: "square", attack: 0.001, decay: 0.07, gain: 0.35 });
    this.noise({ attack: 0.001, decay: 0.05, gain: 0.18, filterFrequency: 420 });
  }

  playSave() {
    this.tone({ frequency: 78, type: "sine", attack: 0.003, decay: 0.16, gain: 0.5 });
    this.noise({ attack: 0.001, decay: 0.09, gain: 0.22, filterFrequency: 260 });
  }

  playGoal() {
    this.tone({ frequency: 523, type: "triangle", attack: 0.004, decay: 0.16, gain: 0.32, delay: 0 });
    this.tone({ frequency: 659, type: "triangle", attack: 0.004, decay: 0.2, gain: 0.34, delay: 0.12 });
    this.tone({ frequency: 784, type: "triangle", attack: 0.004, decay: 0.26, gain: 0.36, delay: 0.24 });
    this.noise({ attack: 0.015, decay: 0.55, gain: 0.08, filterFrequency: 1800, delay: 0.05 });
  }

  playWhistle() {
    this.tone({ frequency: 1560, type: "sine", attack: 0.01, decay: 0.18, gain: 0.22 });
    this.tone({ frequency: 1860, type: "sine", attack: 0.008, decay: 0.12, gain: 0.12, delay: 0.04 });
  }

  tone({ frequency, type, attack, decay, gain, delay = 0 }) {
    if (!this.context || !this.master) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(gain, start + attack);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + attack + decay);
    oscillator.connect(envelope);
    envelope.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + attack + decay + 0.02);
  }

  noise({ attack, decay, gain, filterFrequency, delay = 0 }) {
    if (!this.context || !this.master) return;
    const start = this.context.currentTime + delay;
    const length = Math.max(1, Math.floor(this.context.sampleRate * (attack + decay + 0.03)));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const envelope = this.context.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = filterFrequency;
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(gain, start + attack);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + attack + decay);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.master);
    source.start(start);
    source.stop(start + attack + decay + 0.03);
  }
}

function classifyEvent(text) {
  if (text.includes("破门") || text.includes("进球，比分")) return "goal";
  if (text.includes("黄牌") || text.includes("红牌") || text.includes("换人")) return "whistle";
  if (text.includes("越位")) return "whistle";
  if (text.includes("全场结束") || text.includes("获得角球") || text.includes("获得门球") || text.includes("获得边线球")) return "whistle";
  if (text.includes("开球")) return "whistle";
  if (text.includes("起脚射门") || text.includes("远射")) return "shot";
  if (text.includes("扑救") || text.includes("挡出")) return "save";
  if (
    text.includes("抢断") ||
    text.includes("抄截") ||
    text.includes("捅开") ||
    text.includes("拼下球权") ||
    text.includes("控制住乱球")
  ) {
    return "tackle";
  }
  if (
    text.includes("传给") ||
    text.includes("直塞") ||
    text.includes("传中") ||
    text.includes("倒三角") ||
    text.includes("扫向门前") ||
    text.includes("解围") ||
    text.includes("开出角球") ||
    text.includes("开出门球") ||
    text.includes("开出任意球") ||
    text.includes("掷出边线球") ||
    text.includes("分球给") ||
    text.includes("大脚开向前场") ||
    text.includes("大脚开出门球") ||
    text.includes("掷向前场") ||
    text.includes("接球") ||
    text.includes("拿到二点球")
  ) {
    return "pass";
  }
  return null;
}
