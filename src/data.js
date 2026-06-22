export const FIELD = {
  width: 105,
  height: 68,
  goalWidth: 14.02,
  penaltyDepth: 16.5,
  penaltyWidth: 40.32,
  goalAreaDepth: 5.5,
  goalAreaWidth: 18.32,
};

export const MATCH = {
  seconds: 600,
  timeScale: 1,
  goalPauseSeconds: 2.2,
  fullTimePauseSeconds: 5,
};

export const PLAYER_RENDERING = {
  mode: "stickman",
  showNumbers: true,
};

export const DISCIPLINE = {
  yellowCardsPerMatch: 1,
  redCardsPerMatch: 0,
  yellowCardsBeforeRed: 2,
};

export const FOULS = {
  enabled: true,
  baseChance: 0.012,
  maxChancePerChallenge: 0.016,
  cooldownSeconds: 8,
  penaltyAreaChanceMultiplier: 0.04,
  yellowCardChance: 0.14,
  redCardChance: 0.004,
};

export const RESTART_EVENTS = {
  touchlineChallengeChance: 0.18,
  blockedCrossCornerChance: 0.36,
  throwInCatchupAfter: 0.28,
  cornerCatchupAfter: 0.44,
};

export const SUBSTITUTIONS = {
  maxPerTeam: 5,
};

export const OFFSIDE = {
  enabled: true,
  baseChance: 0.62,
  throughBallBonus: 0.2,
  crossChance: 0.36,
  cooldownSeconds: 26,
};

export const TACTICS = {
  balanced: {
    id: "balanced",
    name: "均衡推进",
    description: "保持阵型宽度，优先寻找安全传球和中路二次进攻。",
    shape: {
      width: 0.42,
      roleAdvance: { FB: 0, W: 0, AM: 0, ST: 0, CM: 0 },
      centralTuck: 0.16,
    },
    passing: {
      forwardWeight: 2.1,
      wingBonus: 8,
      centralBonus: 8,
      strikerBonus: 14,
      passRate: 0.34,
    },
    actions: {
      crossChance: 0.08,
      throughChance: 0.1,
      shotMultiplier: 1,
      dribbleForward: 1,
    },
    defense: {
      pressDistance: 18,
      coverDepth: 0.22,
    },
  },
  wingCross: {
    id: "wingCross",
    name: "下底传中",
    description: "边锋和边后卫拉开宽度，推进到边路后优先传中找禁区内队友。",
    shape: {
      width: 0.86,
      roleAdvance: { FB: 3.2, W: 5.2, AM: 1.4, ST: 1.8, CM: 0.6 },
      centralTuck: 0.05,
    },
    passing: {
      forwardWeight: 1.75,
      wingBonus: 44,
      centralBonus: -8,
      strikerBonus: 20,
      passRate: 0.43,
    },
    actions: {
      crossChance: 0.82,
      throughChance: 0.02,
      shotMultiplier: 0.84,
      dribbleForward: 1.18,
    },
    defense: {
      pressDistance: 17,
      coverDepth: 0.2,
    },
  },
  centralPenetration: {
    id: "centralPenetration",
    name: "中路渗透",
    description: "边路适度内收，前腰和中锋在肋部寻找直塞与撞墙配合。",
    shape: {
      width: 0.18,
      roleAdvance: { FB: -0.8, W: -1.4, AM: 3.8, ST: 2.6, CM: 2.2 },
      centralTuck: 0.48,
    },
    passing: {
      forwardWeight: 2.55,
      wingBonus: -8,
      centralBonus: 28,
      strikerBonus: 26,
      passRate: 0.42,
    },
    actions: {
      crossChance: 0.03,
      throughChance: 0.34,
      shotMultiplier: 1.08,
      dribbleForward: 0.92,
    },
    defense: {
      pressDistance: 19,
      coverDepth: 0.26,
    },
  },
};

export const TACTIC_OPTIONS = Object.values(TACTICS).map((tactic) => ({
  id: tactic.id,
  name: tactic.name,
}));

export const DEFAULT_ATTRIBUTES = {
  speed: 62,
  passing: 62,
  shooting: 58,
  dribbling: 60,
  defense: 55,
  keeping: 20,
};

export const POSITION_ATTRIBUTE_TEMPLATES = {
  GK: { speed: 48, passing: 54, shooting: 12, dribbling: 35, defense: 50, keeping: 72 },
  CB: { speed: 58, passing: 56, shooting: 30, dribbling: 42, defense: 72, keeping: 10 },
  FB: { speed: 68, passing: 61, shooting: 38, dribbling: 58, defense: 66, keeping: 10 },
  DM: { speed: 61, passing: 68, shooting: 45, dribbling: 58, defense: 68, keeping: 10 },
  CM: { speed: 64, passing: 70, shooting: 52, dribbling: 64, defense: 60, keeping: 10 },
  AM: { speed: 67, passing: 72, shooting: 63, dribbling: 72, defense: 45, keeping: 10 },
  W: { speed: 75, passing: 65, shooting: 62, dribbling: 73, defense: 44, keeping: 10 },
  ST: { speed: 70, passing: 58, shooting: 75, dribbling: 68, defense: 34, keeping: 10 },
};

const ATTRIBUTE_VALUE_WEIGHTS = {
  GK: { speed: 0.16, passing: 0.38, shooting: 0.04, dribbling: 0.18, defense: 0.28, keeping: 0.95 },
  CB: { speed: 0.42, passing: 0.36, shooting: 0.08, dribbling: 0.18, defense: 0.88, keeping: 0 },
  FB: { speed: 0.68, passing: 0.42, shooting: 0.14, dribbling: 0.42, defense: 0.62, keeping: 0 },
  DM: { speed: 0.34, passing: 0.74, shooting: 0.18, dribbling: 0.4, defense: 0.78, keeping: 0 },
  CM: { speed: 0.42, passing: 0.82, shooting: 0.28, dribbling: 0.62, defense: 0.48, keeping: 0 },
  AM: { speed: 0.52, passing: 0.86, shooting: 0.56, dribbling: 0.82, defense: 0.18, keeping: 0 },
  W: { speed: 0.92, passing: 0.46, shooting: 0.48, dribbling: 0.9, defense: 0.16, keeping: 0 },
  ST: { speed: 0.7, passing: 0.28, shooting: 0.92, dribbling: 0.62, defense: 0.08, keeping: 0 },
};

const PLAYER_NAME_POOL = [
  "林远",
  "周骁",
  "陈澈",
  "沈舟",
  "顾辰",
  "陆岩",
  "何川",
  "许宁",
  "梁越",
  "韩序",
  "赵屿",
  "秦朗",
  "宋砚",
  "唐森",
  "高牧",
  "魏然",
  "方驰",
  "罗峻",
  "段凌",
  "叶青",
  "蒋岳",
  "邵衡",
  "程野",
  "萧逸",
  "孟钧",
  "黎昊",
  "钟锐",
  "夏鸣",
  "江临",
  "任柏",
  "傅航",
  "白星",
  "丁原",
  "马越",
  "曹烨",
  "石安",
  "薛同",
  "曾沐",
  "贺南",
  "尹川",
  "范霖",
  "易寒",
  "苏曜",
  "温岭",
];

export const FORMATIONS = {
  "4-3-3": [
    { number: 1, name: "北城 1", position: "GK", role: "GK", anchor: { x: 6, y: 34 } },
    { number: 2, name: "北城 2", position: "RB", role: "FB", anchor: { x: 20, y: 56 } },
    { number: 4, name: "北城 4", position: "RCB", role: "CB", anchor: { x: 18, y: 40 } },
    { number: 5, name: "北城 5", position: "LCB", role: "CB", anchor: { x: 18, y: 28 } },
    { number: 3, name: "北城 3", position: "LB", role: "FB", anchor: { x: 20, y: 12 } },
    { number: 6, name: "北城 6", position: "DM", role: "DM", anchor: { x: 38, y: 34 } },
    { number: 8, name: "北城 8", position: "RCM", role: "CM", anchor: { x: 48, y: 47 } },
    { number: 10, name: "北城 10", position: "LCM", role: "AM", anchor: { x: 50, y: 22 } },
    { number: 7, name: "北城 7", position: "RW", role: "W", anchor: { x: 72, y: 56 } },
    { number: 9, name: "北城 9", position: "ST", role: "ST", anchor: { x: 78, y: 34 } },
    { number: 11, name: "北城 11", position: "LW", role: "W", anchor: { x: 72, y: 12 } },
  ],
  "4-4-2": [
    { number: 1, name: "海港 1", position: "GK", role: "GK", anchor: { x: 6, y: 34 } },
    { number: 2, name: "海港 2", position: "RB", role: "FB", anchor: { x: 20, y: 56 } },
    { number: 4, name: "海港 4", position: "RCB", role: "CB", anchor: { x: 18, y: 41 } },
    { number: 5, name: "海港 5", position: "LCB", role: "CB", anchor: { x: 18, y: 27 } },
    { number: 3, name: "海港 3", position: "LB", role: "FB", anchor: { x: 20, y: 12 } },
    { number: 7, name: "海港 7", position: "RM", role: "W", anchor: { x: 46, y: 56 } },
    { number: 6, name: "海港 6", position: "RCM", role: "DM", anchor: { x: 42, y: 40 } },
    { number: 8, name: "海港 8", position: "LCM", role: "CM", anchor: { x: 42, y: 28 } },
    { number: 11, name: "海港 11", position: "LM", role: "W", anchor: { x: 46, y: 12 } },
    { number: 9, name: "海港 9", position: "RS", role: "ST", anchor: { x: 72, y: 40 } },
    { number: 10, name: "海港 10", position: "LS", role: "ST", anchor: { x: 72, y: 28 } },
  ],
  "4-2-3-1": [
    { number: 1, name: "战术板 1", position: "GK", role: "GK", anchor: { x: 6, y: 34 } },
    { number: 2, name: "战术板 2", position: "RB", role: "FB", anchor: { x: 20, y: 56 } },
    { number: 4, name: "战术板 4", position: "RCB", role: "CB", anchor: { x: 18, y: 41 } },
    { number: 5, name: "战术板 5", position: "LCB", role: "CB", anchor: { x: 18, y: 27 } },
    { number: 3, name: "战术板 3", position: "LB", role: "FB", anchor: { x: 20, y: 12 } },
    { number: 6, name: "战术板 6", position: "RDM", role: "DM", anchor: { x: 36, y: 41 } },
    { number: 8, name: "战术板 8", position: "LDM", role: "CM", anchor: { x: 36, y: 27 } },
    { number: 7, name: "战术板 7", position: "RW", role: "W", anchor: { x: 62, y: 56 } },
    { number: 10, name: "战术板 10", position: "AM", role: "AM", anchor: { x: 60, y: 34 } },
    { number: 11, name: "战术板 11", position: "LW", role: "W", anchor: { x: 62, y: 12 } },
    { number: 9, name: "战术板 9", position: "ST", role: "ST", anchor: { x: 78, y: 34 } },
  ],
  "5-3-2": [
    { number: 1, name: "战术板 1", position: "GK", role: "GK", anchor: { x: 6, y: 34 } },
    { number: 2, name: "战术板 2", position: "RWB", role: "FB", anchor: { x: 26, y: 58 } },
    { number: 4, name: "战术板 4", position: "RCB", role: "CB", anchor: { x: 18, y: 44 } },
    { number: 5, name: "战术板 5", position: "CB", role: "CB", anchor: { x: 16, y: 34 } },
    { number: 3, name: "战术板 3", position: "LCB", role: "CB", anchor: { x: 18, y: 24 } },
    { number: 12, name: "战术板 12", position: "LWB", role: "FB", anchor: { x: 26, y: 10 } },
    { number: 6, name: "战术板 6", position: "RCM", role: "DM", anchor: { x: 43, y: 45 } },
    { number: 8, name: "战术板 8", position: "CM", role: "CM", anchor: { x: 45, y: 34 } },
    { number: 10, name: "战术板 10", position: "LCM", role: "AM", anchor: { x: 43, y: 23 } },
    { number: 9, name: "战术板 9", position: "RS", role: "ST", anchor: { x: 72, y: 40 } },
    { number: 11, name: "战术板 11", position: "LS", role: "ST", anchor: { x: 72, y: 28 } },
  ],
  "3-4-2-1": [
    { number: 1, name: "战术板 1", position: "GK", role: "GK", anchor: { x: 6, y: 34 } },
    { number: 4, name: "战术板 4", position: "RCB", role: "CB", anchor: { x: 18, y: 46 } },
    { number: 5, name: "战术板 5", position: "CB", role: "CB", anchor: { x: 16, y: 34 } },
    { number: 3, name: "战术板 3", position: "LCB", role: "CB", anchor: { x: 18, y: 22 } },
    { number: 2, name: "战术板 2", position: "RWB", role: "FB", anchor: { x: 38, y: 58 } },
    { number: 6, name: "战术板 6", position: "RCM", role: "DM", anchor: { x: 40, y: 41 } },
    { number: 8, name: "战术板 8", position: "LCM", role: "CM", anchor: { x: 40, y: 27 } },
    { number: 12, name: "战术板 12", position: "LWB", role: "FB", anchor: { x: 38, y: 10 } },
    { number: 10, name: "战术板 10", position: "RAM", role: "AM", anchor: { x: 61, y: 42 } },
    { number: 11, name: "战术板 11", position: "LAM", role: "AM", anchor: { x: 61, y: 26 } },
    { number: 9, name: "战术板 9", position: "ST", role: "ST", anchor: { x: 78, y: 34 } },
  ],
};

export const FORMATION_OPTIONS = Object.keys(FORMATIONS).map((id) => ({ id, name: id }));

export const MATCH_TEAM_CODES = ["ESP", "KSA"];

const DEFAULT_TACTIC_POOL = ["balanced", "wingCross", "centralPenetration"];

const WORLD_CUP_COUNTRY_PROFILES = [
  countryProfile("CAN", "加拿大", "Canada", "#d71920", "#ffffff", "4-4-2"),
  {
    ...countryProfile("MEX", "墨西哥", "Mexico", "#006847", "#ce1126", "4-3-3"),
    kit: {
      home: { shirt: "#006847", trim: "#ce1126", shorts: "#ffffff" },
      away: { shirt: "#ffffff", trim: "#006847", shorts: "#ffffff" },
    },
    starterIds: [
      "mex-raul-rangel",
      "mex-jorge-sanchez",
      "mex-cesar-montes",
      "mex-edson-alvarez",
      "mex-johan-vasquez",
      "mex-erik-lira",
      "mex-luis-romo",
      "mex-alvaro-fidalgo",
      "mex-raul-jimenez",
      "mex-alexis-vega",
      "mex-santiago-gimenez",
    ],
    squad: [
      { id: "mex-raul-rangel", name: "劳尔·兰赫尔", number: 1, position: "GK", role: "GK", marketValueM: 4, attributes: { speed: 51, passing: 55, shooting: 10, dribbling: 36, defense: 53, keeping: 80 } },
      { id: "mex-jorge-sanchez", name: "豪尔赫·桑切斯", number: 2, position: "DF", role: "CB", marketValueM: 4, attributes: { speed: 58, passing: 62, shooting: 32, dribbling: 40, defense: 78, keeping: 4 } },
      { id: "mex-cesar-montes", name: "蒙特斯", number: 3, position: "DF", role: "CB", marketValueM: 6, attributes: { speed: 64, passing: 57, shooting: 27, dribbling: 45, defense: 80, keeping: 9 } },
      { id: "mex-edson-alvarez", name: "埃德森·阿尔瓦雷斯", number: 4, position: "DF", role: "CB", marketValueM: 20, attributes: { speed: 63, passing: 61, shooting: 34, dribbling: 40, defense: 83, keeping: 6 } },
      { id: "mex-johan-vasquez", name: "巴斯克斯", number: 5, position: "DF", role: "CB", marketValueM: 10, attributes: { speed: 66, passing: 57, shooting: 29, dribbling: 48, defense: 79, keeping: 8 } },
      { id: "mex-erik-lira", name: "利拉", number: 6, position: "MF", role: "CM", marketValueM: 5, attributes: { speed: 70, passing: 73, shooting: 57, dribbling: 73, defense: 67, keeping: 7 } },
      { id: "mex-luis-romo", name: "罗莫", number: 7, position: "MF", role: "CM", marketValueM: 4, attributes: { speed: 68, passing: 79, shooting: 57, dribbling: 70, defense: 59, keeping: 8 } },
      { id: "mex-alvaro-fidalgo", name: "菲达尔戈", number: 8, position: "MF", role: "CM", marketValueM: 8, attributes: { speed: 70, passing: 79, shooting: 58, dribbling: 72, defense: 60, keeping: 10 } },
      { id: "mex-raul-jimenez", name: "劳尔·希门尼斯", number: 9, position: "FW", role: "ST", marketValueM: 4, attributes: { speed: 78, passing: 60, shooting: 85, dribbling: 75, defense: 31, keeping: 6 } },
      { id: "mex-alexis-vega", name: "韦加", number: 10, position: "FW", role: "ST", marketValueM: 5, attributes: { speed: 76, passing: 61, shooting: 80, dribbling: 75, defense: 37, keeping: 5 } },
      { id: "mex-santiago-gimenez", name: "圣地亚哥·希门尼斯", number: 11, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 77, passing: 61, shooting: 88, dribbling: 76, defense: 34, keeping: 10 } },
      { id: "mex-carlos-acevedo", name: "阿塞维多", number: 12, position: "GK", role: "GK", marketValueM: 3, attributes: { speed: 47, passing: 57, shooting: 16, dribbling: 32, defense: 55, keeping: 83 } },
      { id: "mex-guillermo-ochoa", name: "奥乔亚", number: 13, position: "GK", role: "GK", marketValueM: 1, attributes: { speed: 49, passing: 59, shooting: 10, dribbling: 38, defense: 51, keeping: 76 } },
      { id: "mex-armando-gonzalez", name: "阿曼多·冈萨雷斯", number: 14, position: "FW", role: "ST", marketValueM: 6, attributes: { speed: 73, passing: 56, shooting: 83, dribbling: 73, defense: 37, keeping: 6 } },
      { id: "mex-israel-reyes", name: "雷耶斯", number: 15, position: "DF", role: "CB", marketValueM: 5, attributes: { speed: 63, passing: 59, shooting: 31, dribbling: 39, defense: 76, keeping: 8 } },
      { id: "mex-julian-quinones", name: "基尼奥内斯", number: 16, position: "FW", role: "ST", marketValueM: 8, attributes: { speed: 79, passing: 57, shooting: 84, dribbling: 75, defense: 31, keeping: 5 } },
      { id: "mex-orbelin-pineda", name: "皮内达", number: 17, position: "MF", role: "CM", marketValueM: 6, attributes: { speed: 71, passing: 75, shooting: 51, dribbling: 70, defense: 66, keeping: 9 } },
      { id: "mex-obed-vargas", name: "奥贝德·巴尔加斯", number: 18, position: "MF", role: "CM", marketValueM: 7, attributes: { speed: 70, passing: 73, shooting: 57, dribbling: 71, defense: 60, keeping: 10 } },
      { id: "mex-gilberto-mora", name: "希尔伯托·莫拉", number: 19, position: "MF", role: "CM", marketValueM: 6, attributes: { speed: 64, passing: 77, shooting: 53, dribbling: 65, defense: 66, keeping: 10 } },
      { id: "mex-mateo-chavez", name: "马特奥·查韦斯", number: 20, position: "DF", role: "CB", marketValueM: 4, attributes: { speed: 62, passing: 59, shooting: 27, dribbling: 47, defense: 75, keeping: 4 } },
      { id: "mex-cesar-huerta", name: "韦尔塔", number: 21, position: "FW", role: "ST", marketValueM: 7, attributes: { speed: 78, passing: 58, shooting: 83, dribbling: 72, defense: 38, keeping: 5 } },
      { id: "mex-guillermo-martinez", name: "吉列尔莫·马丁内斯", number: 22, position: "FW", role: "ST", marketValueM: 3, attributes: { speed: 76, passing: 56, shooting: 83, dribbling: 70, defense: 35, keeping: 7 } },
      { id: "mex-jesus-gallardo", name: "加利亚多", number: 23, position: "DF", role: "CB", marketValueM: 3, attributes: { speed: 63, passing: 58, shooting: 27, dribbling: 39, defense: 75, keeping: 10 } },
      { id: "mex-luis-chavez", name: "路易斯·查韦斯", number: 24, position: "MF", role: "CM", marketValueM: 7, attributes: { speed: 67, passing: 74, shooting: 52, dribbling: 66, defense: 61, keeping: 8 } },
      { id: "mex-roberto-alvarado", name: "阿尔瓦拉多", number: 25, position: "FW", role: "ST", marketValueM: 7, attributes: { speed: 80, passing: 57, shooting: 81, dribbling: 74, defense: 33, keeping: 10 } },
      { id: "mex-brian-gutierrez", name: "布赖恩·古铁雷斯", number: 26, position: "MF", role: "CM", marketValueM: 4, attributes: { speed: 63, passing: 77, shooting: 50, dribbling: 65, defense: 64, keeping: 7 } },
    ],
  },
  {
    ...countryProfile("USA", "美国", "United States", "#1f4e9d", "#d71920", "4-3-3"),
    kit: {
      home: { shirt: "#ffffff", trim: "#1f4e9d", shorts: "#1f4e9d" },
      away: { shirt: "#1f4e9d", trim: "#d71920", shorts: "#1f4e9d" },
    },
    starterIds: [
      "usa-matt-turner",
      "usa-sergino-dest",
      "usa-chris-richards",
      "usa-tyler-adams",
      "usa-antonee-robinson",
      "usa-auston-trusty",
      "usa-giovanni-reyna",
      "usa-weston-mckennie",
      "usa-ricardo-pepi",
      "usa-christian-pulisic",
      "usa-brenden-aaronson",
    ],
    squad: [
      { id: "usa-matt-turner", name: "特纳", number: 1, position: "GK", role: "GK", marketValueM: 3, attributes: { speed: 51, passing: 57, shooting: 13, dribbling: 39, defense: 54, keeping: 78 } },
      { id: "usa-sergino-dest", name: "德斯特", number: 2, position: "DF", role: "CB", marketValueM: 12, attributes: { speed: 60, passing: 57, shooting: 34, dribbling: 41, defense: 82, keeping: 9 } },
      { id: "usa-chris-richards", name: "理查兹", number: 3, position: "DF", role: "CB", marketValueM: 12, attributes: { speed: 59, passing: 60, shooting: 27, dribbling: 43, defense: 77, keeping: 10 } },
      { id: "usa-tyler-adams", name: "泰勒·亚当斯", number: 4, position: "MF", role: "CM", marketValueM: 12, attributes: { speed: 64, passing: 82, shooting: 57, dribbling: 71, defense: 62, keeping: 5 } },
      { id: "usa-antonee-robinson", name: "罗宾逊", number: 5, position: "DF", role: "CB", marketValueM: 20, attributes: { speed: 64, passing: 59, shooting: 32, dribbling: 48, defense: 83, keeping: 9 } },
      { id: "usa-auston-trusty", name: "特鲁斯蒂", number: 6, position: "DF", role: "CB", marketValueM: 6, attributes: { speed: 57, passing: 56, shooting: 33, dribbling: 47, defense: 79, keeping: 8 } },
      { id: "usa-giovanni-reyna", name: "雷纳", number: 7, position: "MF", role: "CM", marketValueM: 18, attributes: { speed: 73, passing: 81, shooting: 51, dribbling: 68, defense: 69, keeping: 4 } },
      { id: "usa-weston-mckennie", name: "麦肯尼", number: 8, position: "MF", role: "CM", marketValueM: 20, attributes: { speed: 70, passing: 83, shooting: 56, dribbling: 76, defense: 64, keeping: 7 } },
      { id: "usa-ricardo-pepi", name: "佩皮", number: 9, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 82, passing: 59, shooting: 88, dribbling: 74, defense: 36, keeping: 5 } },
      { id: "usa-christian-pulisic", name: "普利西奇", number: 10, position: "FW", role: "ST", marketValueM: 50, attributes: { speed: 79, passing: 59, shooting: 93, dribbling: 81, defense: 39, keeping: 10 } },
      { id: "usa-brenden-aaronson", name: "阿伦森", number: 11, position: "FW", role: "ST", marketValueM: 10, attributes: { speed: 77, passing: 63, shooting: 88, dribbling: 72, defense: 32, keeping: 4 } },
      { id: "usa-miles-robinson", name: "迈尔斯·罗宾逊", number: 12, position: "DF", role: "CB", marketValueM: 4, attributes: { speed: 64, passing: 61, shooting: 32, dribbling: 43, defense: 79, keeping: 4 } },
      { id: "usa-tim-ream", name: "里姆", number: 13, position: "DF", role: "CB", marketValueM: 1, attributes: { speed: 62, passing: 53, shooting: 33, dribbling: 39, defense: 77, keeping: 9 } },
      { id: "usa-sebastian-berhalter", name: "贝尔哈特", number: 14, position: "MF", role: "CM", marketValueM: 3, attributes: { speed: 70, passing: 79, shooting: 54, dribbling: 65, defense: 62, keeping: 8 } },
      { id: "usa-cristian-roldan", name: "罗尔丹", number: 15, position: "MF", role: "CM", marketValueM: 1, attributes: { speed: 65, passing: 75, shooting: 56, dribbling: 70, defense: 64, keeping: 6 } },
      { id: "usa-alex-freeman", name: "弗里曼", number: 16, position: "DF", role: "CB", marketValueM: 3, attributes: { speed: 59, passing: 59, shooting: 27, dribbling: 43, defense: 75, keeping: 7 } },
      { id: "usa-malik-tillman", name: "蒂尔曼", number: 17, position: "MF", role: "CM", marketValueM: 35, attributes: { speed: 74, passing: 84, shooting: 58, dribbling: 72, defense: 63, keeping: 9 } },
      { id: "usa-max-arfsten", name: "阿夫斯滕", number: 18, position: "DF", role: "CB", marketValueM: 2, attributes: { speed: 62, passing: 60, shooting: 30, dribbling: 40, defense: 80, keeping: 10 } },
      { id: "usa-haji-wright", name: "哈吉·赖特", number: 19, position: "FW", role: "ST", marketValueM: 8, attributes: { speed: 72, passing: 65, shooting: 85, dribbling: 72, defense: 32, keeping: 4 } },
      { id: "usa-folarin-balogun", name: "巴洛贡", number: 20, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 77, passing: 62, shooting: 89, dribbling: 72, defense: 35, keeping: 7 } },
      { id: "usa-timothy-weah", name: "小维阿", number: 21, position: "FW", role: "ST", marketValueM: 15, attributes: { speed: 79, passing: 57, shooting: 86, dribbling: 72, defense: 38, keeping: 8 } },
      { id: "usa-mark-mckenzie", name: "麦肯齐", number: 22, position: "DF", role: "CB", marketValueM: 5, attributes: { speed: 64, passing: 61, shooting: 33, dribbling: 39, defense: 79, keeping: 6 } },
      { id: "usa-joe-scally", name: "斯卡利", number: 23, position: "DF", role: "CB", marketValueM: 12, attributes: { speed: 66, passing: 64, shooting: 29, dribbling: 47, defense: 84, keeping: 4 } },
      { id: "usa-matt-freese", name: "弗里斯", number: 24, position: "GK", role: "GK", marketValueM: 3, attributes: { speed: 51, passing: 59, shooting: 13, dribbling: 38, defense: 53, keeping: 82 } },
      { id: "usa-chris-brady", name: "布雷迪", number: 25, position: "GK", role: "GK", marketValueM: 4, attributes: { speed: 45, passing: 54, shooting: 10, dribbling: 38, defense: 50, keeping: 77 } },
      { id: "usa-alex-zendejas", name: "曾德哈斯", number: 26, position: "FW", role: "ST", marketValueM: 7, attributes: { speed: 73, passing: 56, shooting: 87, dribbling: 77, defense: 35, keeping: 9 } },
    ],
  },
  countryProfile("CRC", "哥斯达黎加", "Costa Rica", "#d71920", "#001489", "4-4-2"),
  countryProfile("PAN", "巴拿马", "Panama", "#d21034", "#0050a4", "4-4-2"),
  countryProfile("HAI", "海地", "Haiti", "#00209f", "#d21034", "4-3-3"),
  countryProfile("CUW", "库拉索", "Curacao", "#003da5", "#f9d616", "4-2-3-1"),
  countryProfile("JAM", "牙买加", "Jamaica", "#009b3a", "#fed100", "4-3-3"),
  {
    ...countryProfile("JPN", "日本", "Japan", "#1d3f8f", "#ffffff", "4-2-3-1"),
    kit: {
      home: { shirt: "#1d3f8f", trim: "#ffffff", shorts: "#1d3f8f" },
      away: { shirt: "#ffffff", trim: "#1d3f8f", shorts: "#ffffff" },
    },
    starterIds: [
      "jpn-zion-suzuki",
      "jpn-yukinari-sugawara",
      "jpn-shogo-taniguchi",
      "jpn-kou-itakura",
      "jpn-yuto-nagatomo",
      "jpn-shuto-machino",
      "jpn-ao-tanaka",
      "jpn-takefusa-kubo",
      "jpn-keisuke-goto",
      "jpn-ritsu-doan",
      "jpn-daizen-maeda",
    ],
    squad: [
      { id: "jpn-zion-suzuki", name: "铃木彩艳", number: 1, position: "GK", role: "GK", marketValueM: 10, attributes: { speed: 51, passing: 55, shooting: 9, dribbling: 34, defense: 49, keeping: 86 } },
      { id: "jpn-yukinari-sugawara", name: "菅原由势", number: 2, position: "DF", role: "CB", marketValueM: 10, attributes: { speed: 59, passing: 57, shooting: 32, dribbling: 41, defense: 81, keeping: 6 } },
      { id: "jpn-shogo-taniguchi", name: "谷口彰悟", number: 3, position: "DF", role: "CB", marketValueM: 1, attributes: { speed: 60, passing: 53, shooting: 28, dribbling: 42, defense: 77, keeping: 4 } },
      { id: "jpn-kou-itakura", name: "板仓滉", number: 4, position: "DF", role: "CB", marketValueM: 12, attributes: { speed: 65, passing: 62, shooting: 29, dribbling: 40, defense: 78, keeping: 9 } },
      { id: "jpn-yuto-nagatomo", name: "长友佑都", number: 5, position: "DF", role: "CB", marketValueM: 0.5, attributes: { speed: 55, passing: 59, shooting: 27, dribbling: 42, defense: 75, keeping: 7 } },
      { id: "jpn-shuto-machino", name: "町野修斗", number: 6, position: "FW", role: "ST", marketValueM: 5, attributes: { speed: 73, passing: 61, shooting: 81, dribbling: 75, defense: 39, keeping: 7 } },
      { id: "jpn-ao-tanaka", name: "田中碧", number: 7, position: "MF", role: "CM", marketValueM: 8, attributes: { speed: 70, passing: 79, shooting: 58, dribbling: 70, defense: 67, keeping: 8 } },
      { id: "jpn-takefusa-kubo", name: "久保建英", number: 8, position: "MF", role: "CM", marketValueM: 50, attributes: { speed: 70, passing: 79, shooting: 53, dribbling: 74, defense: 70, keeping: 8 } },
      { id: "jpn-keisuke-goto", name: "后藤启介", number: 9, position: "FW", role: "ST", marketValueM: 3, attributes: { speed: 78, passing: 59, shooting: 82, dribbling: 72, defense: 35, keeping: 7 } },
      { id: "jpn-ritsu-doan", name: "堂安律", number: 10, position: "MF", role: "CM", marketValueM: 18, attributes: { speed: 70, passing: 78, shooting: 54, dribbling: 67, defense: 62, keeping: 8 } },
      { id: "jpn-daizen-maeda", name: "前田大然", number: 11, position: "MF", role: "CM", marketValueM: 8, attributes: { speed: 67, passing: 77, shooting: 52, dribbling: 70, defense: 62, keeping: 8 } },
      { id: "jpn-keisuke-osako", name: "大迫敬介", number: 12, position: "GK", role: "GK", marketValueM: 1, attributes: { speed: 49, passing: 55, shooting: 16, dribbling: 40, defense: 49, keeping: 80 } },
      { id: "jpn-keito-nakamura", name: "中村敬斗", number: 13, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 70, passing: 78, shooting: 56, dribbling: 72, defense: 62, keeping: 9 } },
      { id: "jpn-junya-ito", name: "伊东纯也", number: 14, position: "MF", role: "CM", marketValueM: 12, attributes: { speed: 70, passing: 76, shooting: 57, dribbling: 68, defense: 63, keeping: 8 } },
      { id: "jpn-daichi-kamada", name: "镰田大地", number: 15, position: "MF", role: "CM", marketValueM: 15, attributes: { speed: 71, passing: 76, shooting: 52, dribbling: 67, defense: 68, keeping: 10 } },
      { id: "jpn-tsuyoshi-watanabe", name: "渡边刚", number: 16, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 65, passing: 62, shooting: 27, dribbling: 43, defense: 83, keeping: 9 } },
      { id: "jpn-yuito-suzuki", name: "铃木唯人", number: 17, position: "MF", role: "CM", marketValueM: 9, attributes: { speed: 70, passing: 74, shooting: 51, dribbling: 68, defense: 61, keeping: 5 } },
      { id: "jpn-ayase-ueda", name: "上田绮世", number: 18, position: "FW", role: "ST", marketValueM: 10, attributes: { speed: 75, passing: 61, shooting: 86, dribbling: 74, defense: 35, keeping: 6 } },
      { id: "jpn-koki-ogawa", name: "小川航基", number: 19, position: "FW", role: "ST", marketValueM: 5, attributes: { speed: 72, passing: 63, shooting: 86, dribbling: 76, defense: 36, keeping: 7 } },
      { id: "jpn-ayumu-seko", name: "濑古步梦", number: 20, position: "DF", role: "CB", marketValueM: 4, attributes: { speed: 57, passing: 60, shooting: 27, dribbling: 40, defense: 78, keeping: 4 } },
      { id: "jpn-hiroki-ito", name: "伊藤洋辉", number: 21, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 65, passing: 60, shooting: 34, dribbling: 46, defense: 78, keeping: 6 } },
      { id: "jpn-takehiro-tomiyasu", name: "富安健洋", number: 22, position: "DF", role: "CB", marketValueM: 30, attributes: { speed: 61, passing: 58, shooting: 28, dribbling: 48, defense: 82, keeping: 9 } },
      { id: "jpn-tomoki-hayakawa", name: "早川友基", number: 23, position: "GK", role: "GK", marketValueM: 1.5, attributes: { speed: 46, passing: 58, shooting: 14, dribbling: 32, defense: 48, keeping: 74 } },
      { id: "jpn-kaishu-sano", name: "佐野海舟", number: 24, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 71, passing: 81, shooting: 58, dribbling: 72, defense: 65, keeping: 7 } },
      { id: "jpn-junnosuke-suzuki", name: "铃木淳之介", number: 25, position: "DF", role: "CB", marketValueM: 4, attributes: { speed: 63, passing: 59, shooting: 33, dribbling: 39, defense: 82, keeping: 10 } },
      { id: "jpn-kento-shiogai", name: "盐贝健人", number: 26, position: "FW", role: "ST", marketValueM: 2, attributes: { speed: 72, passing: 60, shooting: 83, dribbling: 69, defense: 36, keeping: 7 } },
    ],
  },
  countryProfile("IRN", "伊朗", "Iran", "#239f40", "#da0000", "4-2-3-1"),
  countryProfile("KOR", "韩国", "South Korea", "#c60c30", "#003478", "4-2-3-1"),
  countryProfile("UZB", "乌兹别克斯坦", "Uzbekistan", "#0099b5", "#1eb53a", "4-4-2"),
  countryProfile("JOR", "约旦", "Jordan", "#ce1126", "#007a3d", "4-2-3-1"),
  countryProfile("AUS", "澳大利亚", "Australia", "#fcd116", "#00843d", "4-2-3-1"),
  countryProfile("QAT", "卡塔尔", "Qatar", "#8a1538", "#ffffff", "5-3-2"),
  countryProfile("IRQ", "伊拉克", "Iraq", "#ce1126", "#007a3d", "4-2-3-1"),
  {
    ...countryProfile("ARG", "阿根廷", "Argentina", "#75aadb", "#ffffff", "4-3-3"),
    kit: {
      home: { shirt: "#75aadb", trim: "#ffffff", shorts: "#111111" },
      away: { shirt: "#1f2937", trim: "#75aadb", shorts: "#1f2937" },
    },
    starterIds: [
      "arg-juan-musso",
      "arg-marcos-senesi",
      "arg-nicolas-tagliafico",
      "arg-gonzalo-montiel",
      "arg-leandro-paredes",
      "arg-lisandro-martinez",
      "arg-rodrigo-de-paul",
      "arg-valentin-barco",
      "arg-julian-alvarez",
      "arg-lionel-messi",
      "arg-giovani-lo-celso",
    ],
    squad: [
      { id: "arg-juan-musso", name: "穆索", number: 1, position: "GK", role: "GK", marketValueM: 3, attributes: { speed: 49, passing: 58, shooting: 12, dribbling: 37, defense: 51, keeping: 81 } },
      { id: "arg-marcos-senesi", name: "塞内西", number: 2, position: "DF", role: "CB", marketValueM: 22, attributes: { speed: 65, passing: 59, shooting: 27, dribbling: 42, defense: 87, keeping: 10 } },
      { id: "arg-nicolas-tagliafico", name: "塔利亚菲科", number: 3, position: "DF", role: "CB", marketValueM: 3.5, attributes: { speed: 60, passing: 56, shooting: 27, dribbling: 46, defense: 74, keeping: 6 } },
      { id: "arg-gonzalo-montiel", name: "蒙铁尔", number: 4, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 63, passing: 56, shooting: 31, dribbling: 46, defense: 81, keeping: 4 } },
      { id: "arg-leandro-paredes", name: "帕雷德斯", number: 5, position: "MF", role: "CM", marketValueM: 8, attributes: { speed: 66, passing: 80, shooting: 55, dribbling: 70, defense: 64, keeping: 7 } },
      { id: "arg-lisandro-martinez", name: "利桑德罗", number: 6, position: "DF", role: "CB", marketValueM: 45, attributes: { speed: 67, passing: 64, shooting: 34, dribbling: 46, defense: 82, keeping: 10 } },
      { id: "arg-rodrigo-de-paul", name: "德保罗", number: 7, position: "MF", role: "CM", marketValueM: 18, attributes: { speed: 65, passing: 80, shooting: 51, dribbling: 68, defense: 69, keeping: 7 } },
      { id: "arg-valentin-barco", name: "巴尔科", number: 8, position: "MF", role: "CM", marketValueM: 12, attributes: { speed: 72, passing: 81, shooting: 57, dribbling: 71, defense: 65, keeping: 10 } },
      { id: "arg-julian-alvarez", name: "阿尔瓦雷斯", number: 9, position: "FW", role: "ST", marketValueM: 90, attributes: { speed: 86, passing: 63, shooting: 88, dribbling: 83, defense: 35, keeping: 9 } },
      { id: "arg-lionel-messi", name: "梅西", number: 10, position: "FW", role: "ST", marketValueM: 18, attributes: { speed: 82, passing: 64, shooting: 86, dribbling: 72, defense: 38, keeping: 9 } },
      { id: "arg-giovani-lo-celso", name: "洛塞尔索", number: 11, position: "MF", role: "CM", marketValueM: 16, attributes: { speed: 67, passing: 79, shooting: 51, dribbling: 67, defense: 66, keeping: 10 } },
      { id: "arg-geronimo-rulli", name: "鲁利", number: 12, position: "GK", role: "GK", marketValueM: 4, attributes: { speed: 49, passing: 53, shooting: 9, dribbling: 35, defense: 56, keeping: 82 } },
      { id: "arg-cristian-romero", name: "罗梅罗", number: 13, position: "DF", role: "CB", marketValueM: 65, attributes: { speed: 62, passing: 66, shooting: 35, dribbling: 48, defense: 84, keeping: 10 } },
      { id: "arg-exequiel-palacios", name: "帕拉西奥斯", number: 14, position: "MF", role: "CM", marketValueM: 35, attributes: { speed: 68, passing: 83, shooting: 55, dribbling: 69, defense: 64, keeping: 9 } },
      { id: "arg-nico-gonzalez", name: "尼科·冈萨雷斯", number: 15, position: "MF", role: "CM", marketValueM: 35, attributes: { speed: 69, passing: 78, shooting: 58, dribbling: 75, defense: 66, keeping: 10 } },
      { id: "arg-thiago-almada", name: "阿尔马达", number: 16, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 75, passing: 63, shooting: 85, dribbling: 77, defense: 37, keeping: 6 } },
      { id: "arg-giuliano-simeone", name: "小西蒙尼", number: 17, position: "FW", role: "ST", marketValueM: 18, attributes: { speed: 80, passing: 61, shooting: 86, dribbling: 73, defense: 38, keeping: 4 } },
      { id: "arg-nico-paz", name: "尼科·帕斯", number: 18, position: "FW", role: "ST", marketValueM: 35, attributes: { speed: 76, passing: 62, shooting: 85, dribbling: 74, defense: 39, keeping: 9 } },
      { id: "arg-nicolas-otamendi", name: "奥塔门迪", number: 19, position: "DF", role: "CB", marketValueM: 2, attributes: { speed: 62, passing: 55, shooting: 27, dribbling: 42, defense: 73, keeping: 10 } },
      { id: "arg-alexis-mac-allister", name: "麦卡利斯特", number: 20, position: "MF", role: "CM", marketValueM: 80, attributes: { speed: 73, passing: 86, shooting: 61, dribbling: 71, defense: 68, keeping: 6 } },
      { id: "arg-jose-manuel-lopez", name: "何塞·洛佩斯", number: 21, position: "FW", role: "ST", marketValueM: 8, attributes: { speed: 79, passing: 58, shooting: 81, dribbling: 77, defense: 32, keeping: 5 } },
      { id: "arg-lautaro-martinez", name: "劳塔罗", number: 22, position: "FW", role: "ST", marketValueM: 95, attributes: { speed: 84, passing: 67, shooting: 91, dribbling: 78, defense: 33, keeping: 4 } },
      { id: "arg-emiliano-martinez", name: "埃米利亚诺·马丁内斯", number: 23, position: "GK", role: "GK", marketValueM: 22, attributes: { speed: 50, passing: 61, shooting: 17, dribbling: 37, defense: 56, keeping: 90 } },
      { id: "arg-enzo-fernandez", name: "恩佐", number: 24, position: "MF", role: "CM", marketValueM: 75, attributes: { speed: 73, passing: 81, shooting: 55, dribbling: 72, defense: 71, keeping: 10 } },
      { id: "arg-facundo-medina", name: "梅迪纳", number: 25, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 67, passing: 59, shooting: 29, dribbling: 45, defense: 81, keeping: 9 } },
      { id: "arg-nahuel-molina", name: "莫利纳", number: 26, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 64, passing: 57, shooting: 32, dribbling: 43, defense: 83, keeping: 9 } },
    ],
  },
  {
    ...countryProfile("BRA", "巴西", "Brazil", "#fedd00", "#009b3a", "4-2-3-1"),
    kit: {
      home: { shirt: "#fedd00", trim: "#009b3a", shorts: "#1d3f8f" },
      away: { shirt: "#1d3f8f", trim: "#fedd00", shorts: "#ffffff" },
    },
    starterIds: [
      "bra-alisson",
      "bra-ederson-silva",
      "bra-gabriel-magalhaes",
      "bra-marquinhos",
      "bra-casemiro",
      "bra-alex-sandro",
      "bra-vinicius-junior",
      "bra-bruno-guimaraes",
      "bra-matheus-cunha",
      "bra-neymar-jr",
      "bra-raphinha",
    ],
    squad: [
      { id: "bra-alisson", name: "阿利松", number: 1, position: "GK", role: "GK", marketValueM: 25, attributes: { speed: 54, passing: 57, shooting: 12, dribbling: 35, defense: 52, keeping: 84 } },
      { id: "bra-ederson-silva", name: "埃德森·席尔瓦", number: 2, position: "MF", role: "CM", marketValueM: 45, attributes: { speed: 74, passing: 86, shooting: 60, dribbling: 75, defense: 71, keeping: 4 } },
      { id: "bra-gabriel-magalhaes", name: "加布里埃尔", number: 3, position: "DF", role: "CB", marketValueM: 75, attributes: { speed: 67, passing: 63, shooting: 32, dribbling: 45, defense: 89, keeping: 4 } },
      { id: "bra-marquinhos", name: "马尔基尼奥斯", number: 4, position: "DF", role: "CB", marketValueM: 45, attributes: { speed: 61, passing: 64, shooting: 32, dribbling: 48, defense: 89, keeping: 5 } },
      { id: "bra-casemiro", name: "卡塞米罗", number: 5, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 70, passing: 79, shooting: 52, dribbling: 73, defense: 61, keeping: 9 } },
      { id: "bra-alex-sandro", name: "阿莱士·桑德罗", number: 6, position: "DF", role: "CB", marketValueM: 1.5, attributes: { speed: 57, passing: 56, shooting: 28, dribbling: 40, defense: 77, keeping: 8 } },
      { id: "bra-vinicius-junior", name: "维尼修斯", number: 7, position: "FW", role: "ST", marketValueM: 170, attributes: { speed: 86, passing: 64, shooting: 93, dribbling: 80, defense: 34, keeping: 9 } },
      { id: "bra-bruno-guimaraes", name: "吉马良斯", number: 8, position: "MF", role: "CM", marketValueM: 80, attributes: { speed: 75, passing: 87, shooting: 59, dribbling: 73, defense: 73, keeping: 9 } },
      { id: "bra-matheus-cunha", name: "库尼亚", number: 9, position: "FW", role: "ST", marketValueM: 60, attributes: { speed: 83, passing: 62, shooting: 90, dribbling: 79, defense: 34, keeping: 8 } },
      { id: "bra-neymar-jr", name: "内马尔", number: 10, position: "FW", role: "ST", marketValueM: 20, attributes: { speed: 83, passing: 60, shooting: 82, dribbling: 80, defense: 32, keeping: 8 } },
      { id: "bra-raphinha", name: "拉菲尼亚", number: 11, position: "FW", role: "ST", marketValueM: 100, attributes: { speed: 85, passing: 67, shooting: 89, dribbling: 80, defense: 33, keeping: 5 } },
      { id: "bra-weverton", name: "韦弗顿", number: 12, position: "GK", role: "GK", marketValueM: 1, attributes: { speed: 51, passing: 53, shooting: 12, dribbling: 34, defense: 53, keeping: 79 } },
      { id: "bra-danilo", name: "达尼洛", number: 13, position: "DF", role: "CB", marketValueM: 5, attributes: { speed: 59, passing: 60, shooting: 35, dribbling: 45, defense: 82, keeping: 7 } },
      { id: "bra-bremer", name: "布雷默", number: 14, position: "DF", role: "CB", marketValueM: 50, attributes: { speed: 62, passing: 59, shooting: 28, dribbling: 49, defense: 88, keeping: 5 } },
      { id: "bra-leo-pereira", name: "莱奥·佩雷拉", number: 15, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 63, passing: 59, shooting: 28, dribbling: 45, defense: 77, keeping: 4 } },
      { id: "bra-douglas-santos", name: "道格拉斯·桑托斯", number: 16, position: "DF", role: "CB", marketValueM: 4, attributes: { speed: 63, passing: 62, shooting: 29, dribbling: 47, defense: 74, keeping: 5 } },
      { id: "bra-fabinho", name: "法比尼奥", number: 17, position: "MF", role: "CM", marketValueM: 8, attributes: { speed: 66, passing: 76, shooting: 57, dribbling: 68, defense: 67, keeping: 10 } },
      { id: "bra-danilo-santos", name: "达尼洛·桑托斯", number: 18, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 67, passing: 76, shooting: 56, dribbling: 69, defense: 66, keeping: 7 } },
      { id: "bra-endrick", name: "恩德里克", number: 19, position: "FW", role: "ST", marketValueM: 50, attributes: { speed: 78, passing: 62, shooting: 87, dribbling: 82, defense: 33, keeping: 9 } },
      { id: "bra-lucas-paqueta", name: "帕奎塔", number: 20, position: "MF", role: "CM", marketValueM: 40, attributes: { speed: 70, passing: 84, shooting: 57, dribbling: 70, defense: 64, keeping: 10 } },
      { id: "bra-luiz-henrique", name: "路易斯·恩里克", number: 21, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 77, passing: 65, shooting: 90, dribbling: 76, defense: 38, keeping: 10 } },
      { id: "bra-gabriel-martinelli", name: "马丁内利", number: 22, position: "FW", role: "ST", marketValueM: 55, attributes: { speed: 82, passing: 60, shooting: 91, dribbling: 82, defense: 31, keeping: 8 } },
      { id: "bra-ederson", name: "埃德森", number: 23, position: "GK", role: "GK", marketValueM: 20, attributes: { speed: 52, passing: 55, shooting: 10, dribbling: 41, defense: 54, keeping: 90 } },
      { id: "bra-roger-ibanez", name: "伊巴涅斯", number: 24, position: "DF", role: "CB", marketValueM: 18, attributes: { speed: 62, passing: 61, shooting: 29, dribbling: 40, defense: 87, keeping: 4 } },
      { id: "bra-igor-thiago", name: "伊戈尔·蒂亚戈", number: 25, position: "FW", role: "ST", marketValueM: 20, attributes: { speed: 79, passing: 63, shooting: 87, dribbling: 73, defense: 36, keeping: 10 } },
      { id: "bra-rayan", name: "拉扬", number: 26, position: "FW", role: "ST", marketValueM: 8, attributes: { speed: 73, passing: 58, shooting: 87, dribbling: 73, defense: 36, keeping: 7 } },
    ],
  },
  countryProfile("ECU", "厄瓜多尔", "Ecuador", "#ffd100", "#0033a0", "4-3-3"),
  {
    ...countryProfile("URU", "乌拉圭", "Uruguay", "#5cbfeb", "#ffffff", "4-4-2"),
    kit: {
      home: { shirt: "#5cbfeb", trim: "#ffffff", shorts: "#111111" },
      away: { shirt: "#ffffff", trim: "#5cbfeb", shorts: "#ffffff" },
    },
    starterIds: [
      "uru-sergio-rochet",
      "uru-jose-maria-gimenez",
      "uru-sebastian-caceres",
      "uru-ronald-araujo",
      "uru-manuel-ugarte",
      "uru-rodrigo-bentancur",
      "uru-nicolas-de-la-cruz",
      "uru-federico-valverde",
      "uru-darwin-nunez",
      "uru-giorgian-de-arrascaeta",
      "uru-facundo-pellistri",
    ],
    squad: [
      { id: "uru-sergio-rochet", name: "罗切特", number: 1, position: "GK", role: "GK", marketValueM: 4, attributes: { speed: 53, passing: 53, shooting: 10, dribbling: 37, defense: 52, keeping: 78 } },
      { id: "uru-jose-maria-gimenez", name: "希门尼斯", number: 2, position: "DF", role: "CB", marketValueM: 18, attributes: { speed: 64, passing: 59, shooting: 30, dribbling: 41, defense: 87, keeping: 5 } },
      { id: "uru-sebastian-caceres", name: "卡塞雷斯", number: 3, position: "DF", role: "CB", marketValueM: 5, attributes: { speed: 62, passing: 55, shooting: 27, dribbling: 47, defense: 74, keeping: 5 } },
      { id: "uru-ronald-araujo", name: "阿劳霍", number: 4, position: "DF", role: "CB", marketValueM: 55, attributes: { speed: 68, passing: 66, shooting: 32, dribbling: 49, defense: 86, keeping: 10 } },
      { id: "uru-manuel-ugarte", name: "乌加特", number: 5, position: "MF", role: "CM", marketValueM: 45, attributes: { speed: 72, passing: 81, shooting: 58, dribbling: 77, defense: 72, keeping: 8 } },
      { id: "uru-rodrigo-bentancur", name: "本坦库尔", number: 6, position: "MF", role: "CM", marketValueM: 30, attributes: { speed: 73, passing: 79, shooting: 59, dribbling: 76, defense: 70, keeping: 5 } },
      { id: "uru-nicolas-de-la-cruz", name: "德拉克鲁斯", number: 7, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 66, passing: 77, shooting: 55, dribbling: 73, defense: 67, keeping: 8 } },
      { id: "uru-federico-valverde", name: "巴尔韦德", number: 8, position: "MF", role: "CM", marketValueM: 130, attributes: { speed: 73, passing: 82, shooting: 62, dribbling: 77, defense: 72, keeping: 8 } },
      { id: "uru-darwin-nunez", name: "努涅斯", number: 9, position: "FW", role: "ST", marketValueM: 45, attributes: { speed: 84, passing: 58, shooting: 86, dribbling: 78, defense: 37, keeping: 6 } },
      { id: "uru-giorgian-de-arrascaeta", name: "德阿拉斯卡埃塔", number: 10, position: "MF", role: "CM", marketValueM: 8, attributes: { speed: 70, passing: 76, shooting: 58, dribbling: 67, defense: 60, keeping: 7 } },
      { id: "uru-facundo-pellistri", name: "佩利斯特里", number: 11, position: "FW", role: "ST", marketValueM: 12, attributes: { speed: 77, passing: 65, shooting: 89, dribbling: 77, defense: 32, keeping: 9 } },
      { id: "uru-santiago-mele", name: "梅莱", number: 12, position: "GK", role: "GK", marketValueM: 3, attributes: { speed: 51, passing: 60, shooting: 15, dribbling: 35, defense: 51, keeping: 82 } },
      { id: "uru-guillermo-varela", name: "巴雷拉", number: 13, position: "DF", role: "CB", marketValueM: 1.5, attributes: { speed: 58, passing: 57, shooting: 33, dribbling: 43, defense: 79, keeping: 8 } },
      { id: "uru-agustin-canobbio", name: "卡诺比奥", number: 14, position: "MF", role: "CM", marketValueM: 6, attributes: { speed: 70, passing: 78, shooting: 50, dribbling: 73, defense: 68, keeping: 4 } },
      { id: "uru-emiliano-martinez", name: "埃米利亚诺·马丁内斯", number: 15, position: "MF", role: "CM", marketValueM: 5, attributes: { speed: 70, passing: 73, shooting: 51, dribbling: 71, defense: 62, keeping: 5 } },
      { id: "uru-mathias-olivera", name: "奥利韦拉", number: 16, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 63, passing: 62, shooting: 28, dribbling: 40, defense: 86, keeping: 9 } },
      { id: "uru-matias-vina", name: "比尼亚", number: 17, position: "DF", role: "CB", marketValueM: 6, attributes: { speed: 63, passing: 62, shooting: 31, dribbling: 47, defense: 78, keeping: 6 } },
      { id: "uru-brian-rodriguez", name: "布赖恩·罗德里格斯", number: 18, position: "FW", role: "ST", marketValueM: 8, attributes: { speed: 73, passing: 64, shooting: 87, dribbling: 78, defense: 38, keeping: 5 } },
      { id: "uru-rodrigo-aguirre", name: "阿吉雷", number: 19, position: "FW", role: "ST", marketValueM: 4, attributes: { speed: 79, passing: 64, shooting: 77, dribbling: 71, defense: 33, keeping: 10 } },
      { id: "uru-maxi-araujo", name: "马克西·阿劳霍", number: 20, position: "MF", role: "CM", marketValueM: 15, attributes: { speed: 72, passing: 75, shooting: 56, dribbling: 72, defense: 65, keeping: 6 } },
      { id: "uru-federico-vinas", name: "比尼亚斯", number: 21, position: "FW", role: "ST", marketValueM: 5, attributes: { speed: 74, passing: 62, shooting: 83, dribbling: 69, defense: 32, keeping: 6 } },
      { id: "uru-joaquin-piquerez", name: "皮克雷斯", number: 22, position: "MF", role: "CM", marketValueM: 8, attributes: { speed: 72, passing: 75, shooting: 52, dribbling: 67, defense: 66, keeping: 4 } },
      { id: "uru-fernando-muslera", name: "穆斯莱拉", number: 23, position: "GK", role: "GK", marketValueM: 1, attributes: { speed: 48, passing: 52, shooting: 11, dribbling: 32, defense: 55, keeping: 74 } },
      { id: "uru-santiago-bueno", name: "布埃诺", number: 24, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 61, passing: 60, shooting: 28, dribbling: 46, defense: 86, keeping: 7 } },
      { id: "uru-juan-manuel-sanabria", name: "萨纳夫里亚", number: 25, position: "MF", role: "CM", marketValueM: 5, attributes: { speed: 67, passing: 79, shooting: 56, dribbling: 65, defense: 61, keeping: 9 } },
      { id: "uru-rodrigo-zalazar", name: "萨拉萨尔", number: 26, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 67, passing: 78, shooting: 55, dribbling: 66, defense: 67, keeping: 7 } },
    ],
  },
  {
    ...countryProfile("COL", "哥伦比亚", "Colombia", "#fcd116", "#003893", "4-2-3-1"),
    kit: {
      home: { shirt: "#fcd116", trim: "#003893", shorts: "#003893" },
      away: { shirt: "#003893", trim: "#fcd116", shorts: "#ffffff" },
    },
    starterIds: [
      "col-david-ospina",
      "col-daniel-munoz",
      "col-jhon-lucumi",
      "col-santiago-arias",
      "col-kevin-castano",
      "col-richard-rios",
      "col-luis-diaz",
      "col-jorge-carrascal",
      "col-jhon-cordoba",
      "col-james-rodriguez",
      "col-jhon-arias",
    ],
    squad: [
      { id: "col-david-ospina", name: "奥斯皮纳", number: 1, position: "GK", role: "GK", marketValueM: 1, attributes: { speed: 50, passing: 52, shooting: 15, dribbling: 39, defense: 52, keeping: 77 } },
      { id: "col-daniel-munoz", name: "丹尼尔·穆尼奥斯", number: 2, position: "DF", role: "CB", marketValueM: 18, attributes: { speed: 65, passing: 62, shooting: 29, dribbling: 46, defense: 79, keeping: 10 } },
      { id: "col-jhon-lucumi", name: "卢库米", number: 3, position: "DF", role: "CB", marketValueM: 28, attributes: { speed: 65, passing: 57, shooting: 35, dribbling: 43, defense: 88, keeping: 5 } },
      { id: "col-santiago-arias", name: "阿里亚斯", number: 4, position: "DF", role: "CB", marketValueM: 1.5, attributes: { speed: 58, passing: 53, shooting: 28, dribbling: 47, defense: 71, keeping: 9 } },
      { id: "col-kevin-castano", name: "卡斯塔尼奥", number: 5, position: "MF", role: "CM", marketValueM: 6, attributes: { speed: 69, passing: 74, shooting: 55, dribbling: 66, defense: 62, keeping: 10 } },
      { id: "col-richard-rios", name: "里奥斯", number: 6, position: "MF", role: "CM", marketValueM: 18, attributes: { speed: 70, passing: 82, shooting: 58, dribbling: 71, defense: 65, keeping: 5 } },
      { id: "col-luis-diaz", name: "路易斯·迪亚斯", number: 7, position: "FW", role: "ST", marketValueM: 70, attributes: { speed: 85, passing: 65, shooting: 93, dribbling: 78, defense: 39, keeping: 8 } },
      { id: "col-jorge-carrascal", name: "卡拉斯卡尔", number: 8, position: "MF", role: "CM", marketValueM: 6, attributes: { speed: 63, passing: 76, shooting: 57, dribbling: 67, defense: 60, keeping: 9 } },
      { id: "col-jhon-cordoba", name: "科尔多瓦", number: 9, position: "FW", role: "ST", marketValueM: 15, attributes: { speed: 81, passing: 57, shooting: 83, dribbling: 71, defense: 31, keeping: 10 } },
      { id: "col-james-rodriguez", name: "J罗", number: 10, position: "MF", role: "CM", marketValueM: 4, attributes: { speed: 69, passing: 76, shooting: 52, dribbling: 65, defense: 60, keeping: 6 } },
      { id: "col-jhon-arias", name: "霍恩·阿里亚斯", number: 11, position: "MF", role: "CM", marketValueM: 17, attributes: { speed: 65, passing: 82, shooting: 59, dribbling: 75, defense: 64, keeping: 5 } },
      { id: "col-camilo-vargas", name: "巴尔加斯", number: 12, position: "GK", role: "GK", marketValueM: 2, attributes: { speed: 52, passing: 57, shooting: 9, dribbling: 37, defense: 55, keeping: 79 } },
      { id: "col-yerry-mina", name: "米纳", number: 13, position: "DF", role: "CB", marketValueM: 2, attributes: { speed: 61, passing: 58, shooting: 27, dribbling: 40, defense: 73, keeping: 6 } },
      { id: "col-gustavo-puerta", name: "普埃尔塔", number: 14, position: "DF", role: "CB", marketValueM: 5, attributes: { speed: 65, passing: 55, shooting: 27, dribbling: 44, defense: 77, keeping: 6 } },
      { id: "col-juan-portilla", name: "波蒂利亚", number: 15, position: "MF", role: "CM", marketValueM: 4, attributes: { speed: 65, passing: 77, shooting: 56, dribbling: 70, defense: 62, keeping: 5 } },
      { id: "col-jefferson-lerma", name: "莱尔马", number: 16, position: "MF", role: "CM", marketValueM: 15, attributes: { speed: 73, passing: 80, shooting: 52, dribbling: 75, defense: 64, keeping: 8 } },
      { id: "col-johan-mojica", name: "莫希卡", number: 17, position: "DF", role: "CB", marketValueM: 2.5, attributes: { speed: 64, passing: 56, shooting: 33, dribbling: 46, defense: 76, keeping: 9 } },
      { id: "col-willer-ditta", name: "迪塔", number: 18, position: "DF", role: "CB", marketValueM: 4, attributes: { speed: 60, passing: 55, shooting: 35, dribbling: 45, defense: 77, keeping: 8 } },
      { id: "col-cucho-hernandez", name: "库乔", number: 19, position: "FW", role: "ST", marketValueM: 15, attributes: { speed: 80, passing: 59, shooting: 89, dribbling: 78, defense: 34, keeping: 4 } },
      { id: "col-juan-quintero", name: "金特罗", number: 20, position: "MF", role: "CM", marketValueM: 1.5, attributes: { speed: 68, passing: 77, shooting: 55, dribbling: 66, defense: 59, keeping: 4 } },
      { id: "col-jaminton-campaz", name: "坎帕斯", number: 21, position: "FW", role: "ST", marketValueM: 7, attributes: { speed: 75, passing: 56, shooting: 86, dribbling: 71, defense: 33, keeping: 4 } },
      { id: "col-deiver-machado", name: "马查多", number: 22, position: "DF", role: "CB", marketValueM: 3, attributes: { speed: 62, passing: 62, shooting: 26, dribbling: 39, defense: 74, keeping: 7 } },
      { id: "col-davinson-sanchez", name: "达文森·桑切斯", number: 23, position: "DF", role: "CB", marketValueM: 16, attributes: { speed: 67, passing: 60, shooting: 31, dribbling: 48, defense: 82, keeping: 7 } },
      { id: "col-alvaro-montero", name: "蒙特罗", number: 24, position: "GK", role: "GK", marketValueM: 1.5, attributes: { speed: 46, passing: 58, shooting: 9, dribbling: 40, defense: 55, keeping: 79 } },
      { id: "col-luis-suarez", name: "路易斯·苏亚雷斯", number: 25, position: "FW", role: "ST", marketValueM: 5, attributes: { speed: 76, passing: 60, shooting: 86, dribbling: 72, defense: 35, keeping: 8 } },
      { id: "col-andres-gomez", name: "安德烈斯·戈麦斯", number: 26, position: "FW", role: "ST", marketValueM: 12, attributes: { speed: 74, passing: 60, shooting: 89, dribbling: 71, defense: 34, keeping: 8 } },
    ],
  },
  countryProfile("PAR", "巴拉圭", "Paraguay", "#d52b1e", "#0038a8", "4-4-2"),
  countryProfile("NZL", "新西兰", "New Zealand", "#111111", "#ffffff", "4-4-2"),
  {
    ...countryProfile("MAR", "摩洛哥", "Morocco", "#c1272d", "#006233", "4-3-3"),
    kit: {
      home: { shirt: "#c1272d", trim: "#006233", shorts: "#c1272d" },
      away: { shirt: "#ffffff", trim: "#c1272d", shorts: "#ffffff" },
    },
    starterIds: [
      "mar-yassine-bounou",
      "mar-achraf-hakimi",
      "mar-noussair-mazraoui",
      "mar-sofyan-amrabat",
      "mar-marwane-saadane",
      "mar-ayyoub-bouaddi",
      "mar-chemsdine-talbi",
      "mar-azzedine-ounahi",
      "mar-sou-ane-rahimi",
      "mar-brahim-diaz",
      "mar-ismael-saibari",
    ],
    squad: [
      { id: "mar-yassine-bounou", name: "布努", number: 1, position: "GK", role: "GK", marketValueM: 8, attributes: { speed: 48, passing: 61, shooting: 10, dribbling: 36, defense: 51, keeping: 81 } },
      { id: "mar-achraf-hakimi", name: "阿什拉夫", number: 2, position: "DF", role: "CB", marketValueM: 65, attributes: { speed: 61, passing: 60, shooting: 34, dribbling: 46, defense: 85, keeping: 6 } },
      { id: "mar-noussair-mazraoui", name: "马兹拉维", number: 3, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 68, passing: 62, shooting: 28, dribbling: 48, defense: 80, keeping: 7 } },
      { id: "mar-sofyan-amrabat", name: "阿姆拉巴特", number: 4, position: "MF", role: "CM", marketValueM: 15, attributes: { speed: 70, passing: 77, shooting: 52, dribbling: 68, defense: 67, keeping: 7 } },
      { id: "mar-marwane-saadane", name: "萨达内", number: 5, position: "DF", role: "CB", marketValueM: 0.8, attributes: { speed: 58, passing: 57, shooting: 32, dribbling: 40, defense: 71, keeping: 9 } },
      { id: "mar-ayyoub-bouaddi", name: "布瓦迪", number: 6, position: "MF", role: "CM", marketValueM: 25, attributes: { speed: 71, passing: 84, shooting: 55, dribbling: 76, defense: 69, keeping: 4 } },
      { id: "mar-chemsdine-talbi", name: "塔尔比", number: 7, position: "MF", role: "CM", marketValueM: 12, attributes: { speed: 69, passing: 76, shooting: 57, dribbling: 72, defense: 63, keeping: 5 } },
      { id: "mar-azzedine-ounahi", name: "奥纳希", number: 8, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 67, passing: 74, shooting: 54, dribbling: 66, defense: 62, keeping: 8 } },
      { id: "mar-sou-ane-rahimi", name: "拉希米", number: 9, position: "FW", role: "ST", marketValueM: 6, attributes: { speed: 74, passing: 59, shooting: 84, dribbling: 72, defense: 36, keeping: 8 } },
      { id: "mar-brahim-diaz", name: "迪亚斯", number: 10, position: "FW", role: "ST", marketValueM: 40, attributes: { speed: 82, passing: 60, shooting: 90, dribbling: 74, defense: 32, keeping: 9 } },
      { id: "mar-ismael-saibari", name: "赛巴里", number: 11, position: "MF", role: "CM", marketValueM: 18, attributes: { speed: 68, passing: 76, shooting: 56, dribbling: 74, defense: 66, keeping: 6 } },
      { id: "mar-munir-el-kajoui", name: "穆尼尔", number: 12, position: "GK", role: "GK", marketValueM: 1.5, attributes: { speed: 46, passing: 54, shooting: 10, dribbling: 35, defense: 51, keeping: 77 } },
      { id: "mar-zakaria-el-ouahdi", name: "瓦赫迪", number: 13, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 61, passing: 58, shooting: 28, dribbling: 45, defense: 84, keeping: 5 } },
      { id: "mar-issa-diop", name: "迪奥普", number: 14, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 65, passing: 57, shooting: 35, dribbling: 47, defense: 78, keeping: 9 } },
      { id: "mar-samir-el-mourabet", name: "穆拉贝特", number: 15, position: "MF", role: "CM", marketValueM: 1, attributes: { speed: 66, passing: 76, shooting: 55, dribbling: 65, defense: 65, keeping: 4 } },
      { id: "mar-gessime-yassine", name: "亚辛", number: 16, position: "MF", role: "CM", marketValueM: 2, attributes: { speed: 70, passing: 75, shooting: 50, dribbling: 70, defense: 64, keeping: 7 } },
      { id: "mar-amine-sbai", name: "斯拜", number: 17, position: "FW", role: "ST", marketValueM: 2.5, attributes: { speed: 78, passing: 58, shooting: 78, dribbling: 73, defense: 33, keeping: 4 } },
      { id: "mar-chadi-riad", name: "沙迪·里亚德", number: 18, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 61, passing: 58, shooting: 32, dribbling: 41, defense: 82, keeping: 6 } },
      { id: "mar-youssef-belammari", name: "贝拉马里", number: 19, position: "DF", role: "CB", marketValueM: 2, attributes: { speed: 63, passing: 62, shooting: 26, dribbling: 44, defense: 75, keeping: 5 } },
      { id: "mar-ayoub-el-kaabi", name: "卡比", number: 20, position: "FW", role: "ST", marketValueM: 5, attributes: { speed: 77, passing: 63, shooting: 86, dribbling: 74, defense: 39, keeping: 4 } },
      { id: "mar-ayoube-amaimouni", name: "阿迈穆尼", number: 21, position: "FW", role: "ST", marketValueM: 1, attributes: { speed: 73, passing: 55, shooting: 80, dribbling: 73, defense: 38, keeping: 4 } },
      { id: "mar-ahmed-reda-tagnaouti", name: "塔格诺提", number: 22, position: "GK", role: "GK", marketValueM: 1, attributes: { speed: 48, passing: 53, shooting: 16, dribbling: 38, defense: 54, keeping: 78 } },
      { id: "mar-bilal-el-khannouss", name: "哈努斯", number: 23, position: "MF", role: "CM", marketValueM: 30, attributes: { speed: 68, passing: 81, shooting: 60, dribbling: 77, defense: 63, keeping: 9 } },
      { id: "mar-neil-el-aynaoui", name: "艾纳维", number: 24, position: "MF", role: "CM", marketValueM: 18, attributes: { speed: 66, passing: 78, shooting: 53, dribbling: 69, defense: 64, keeping: 6 } },
      { id: "mar-redouane-halhal", name: "哈尔哈尔", number: 25, position: "DF", role: "CB", marketValueM: 1, attributes: { speed: 61, passing: 55, shooting: 33, dribbling: 42, defense: 77, keeping: 9 } },
      { id: "mar-anass-salah-eddine", name: "萨拉赫-埃丁", number: 26, position: "DF", role: "CB", marketValueM: 7, attributes: { speed: 64, passing: 59, shooting: 32, dribbling: 45, defense: 77, keeping: 7 } },
    ],
  },
  countryProfile("TUN", "突尼斯", "Tunisia", "#e70013", "#ffffff", "4-3-3"),
  countryProfile("EGY", "埃及", "Egypt", "#ce1126", "#ffffff", "4-2-3-1"),
  countryProfile("ALG", "阿尔及利亚", "Algeria", "#006233", "#ffffff", "4-3-3"),
  countryProfile("GHA", "加纳", "Ghana", "#fcd116", "#006b3f", "4-2-3-1"),
  countryProfile("CPV", "佛得角", "Cape Verde", "#003893", "#f7d116", "4-3-3"),
  countryProfile("RSA", "南非", "South Africa", "#007a4d", "#ffb612", "4-2-3-1"),
  countryProfile("CIV", "科特迪瓦", "Ivory Coast", "#f77f00", "#009e60", "4-3-3"),
  {
    ...countryProfile("SEN", "塞内加尔", "Senegal", "#00853f", "#fdef42", "4-3-3"),
    kit: {
      home: { shirt: "#ffffff", trim: "#00853f", shorts: "#00853f" },
      away: { shirt: "#00853f", trim: "#fdef42", shorts: "#00853f" },
    },
    starterIds: [
      "sen-yehvann-diouf",
      "sen-mamadou-sarr",
      "sen-kalidou-koulibaly",
      "sen-abdoulaye-seck",
      "sen-idrissa-gana-gueye",
      "sen-pathe-ciss",
      "sen-assane-diao",
      "sen-lamine-camara",
      "sen-bamba-dieng",
      "sen-sadio-mane",
      "sen-nicolas-jackson",
    ],
    squad: [
      { id: "sen-yehvann-diouf", name: "迪乌夫", number: 1, position: "GK", role: "GK", marketValueM: 6, attributes: { speed: 53, passing: 61, shooting: 12, dribbling: 38, defense: 50, keeping: 82 } },
      { id: "sen-mamadou-sarr", name: "马马杜·萨尔", number: 2, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 62, passing: 59, shooting: 29, dribbling: 41, defense: 85, keeping: 5 } },
      { id: "sen-kalidou-koulibaly", name: "库利巴利", number: 3, position: "DF", role: "CB", marketValueM: 7, attributes: { speed: 66, passing: 60, shooting: 28, dribbling: 46, defense: 82, keeping: 7 } },
      { id: "sen-abdoulaye-seck", name: "塞克", number: 4, position: "DF", role: "CB", marketValueM: 1, attributes: { speed: 58, passing: 55, shooting: 34, dribbling: 42, defense: 71, keeping: 6 } },
      { id: "sen-idrissa-gana-gueye", name: "盖耶", number: 5, position: "MF", role: "CM", marketValueM: 2, attributes: { speed: 66, passing: 70, shooting: 56, dribbling: 66, defense: 58, keeping: 10 } },
      { id: "sen-pathe-ciss", name: "西斯", number: 6, position: "MF", role: "CM", marketValueM: 5, attributes: { speed: 70, passing: 76, shooting: 50, dribbling: 70, defense: 65, keeping: 6 } },
      { id: "sen-assane-diao", name: "阿萨内·迪奥", number: 7, position: "FW", role: "ST", marketValueM: 15, attributes: { speed: 75, passing: 61, shooting: 88, dribbling: 73, defense: 31, keeping: 4 } },
      { id: "sen-lamine-camara", name: "卡马拉", number: 8, position: "MF", role: "CM", marketValueM: 25, attributes: { speed: 74, passing: 83, shooting: 54, dribbling: 75, defense: 65, keeping: 9 } },
      { id: "sen-bamba-dieng", name: "迪昂", number: 9, position: "FW", role: "ST", marketValueM: 5, attributes: { speed: 74, passing: 63, shooting: 82, dribbling: 77, defense: 38, keeping: 4 } },
      { id: "sen-sadio-mane", name: "马内", number: 10, position: "FW", role: "ST", marketValueM: 8, attributes: { speed: 79, passing: 58, shooting: 79, dribbling: 78, defense: 39, keeping: 8 } },
      { id: "sen-nicolas-jackson", name: "杰克逊", number: 11, position: "FW", role: "ST", marketValueM: 50, attributes: { speed: 82, passing: 62, shooting: 93, dribbling: 81, defense: 35, keeping: 6 } },
      { id: "sen-cherif-ndiaye", name: "恩迪亚耶", number: 12, position: "FW", role: "ST", marketValueM: 3, attributes: { speed: 74, passing: 57, shooting: 79, dribbling: 69, defense: 37, keeping: 4 } },
      { id: "sen-iliman-ndiaye", name: "伊利曼·恩迪亚耶", number: 13, position: "FW", role: "ST", marketValueM: 18, attributes: { speed: 77, passing: 60, shooting: 90, dribbling: 79, defense: 32, keeping: 4 } },
      { id: "sen-ismail-jakobs", name: "雅各布斯", number: 14, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 66, passing: 60, shooting: 30, dribbling: 47, defense: 82, keeping: 7 } },
      { id: "sen-krepin-diatta", name: "迪亚塔", number: 15, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 65, passing: 57, shooting: 34, dribbling: 40, defense: 78, keeping: 6 } },
      { id: "sen-edouard-mendy", name: "门迪", number: 16, position: "GK", role: "GK", marketValueM: 5, attributes: { speed: 46, passing: 54, shooting: 10, dribbling: 36, defense: 53, keeping: 80 } },
      { id: "sen-pape-matar-sarr", name: "帕普·萨尔", number: 17, position: "MF", role: "CM", marketValueM: 35, attributes: { speed: 70, passing: 81, shooting: 55, dribbling: 76, defense: 63, keeping: 4 } },
      { id: "sen-ismaila-sarr", name: "伊斯梅拉·萨尔", number: 18, position: "FW", role: "ST", marketValueM: 15, attributes: { speed: 79, passing: 65, shooting: 84, dribbling: 75, defense: 39, keeping: 4 } },
      { id: "sen-moussa-niakhate", name: "尼亚卡特", number: 19, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 65, passing: 62, shooting: 27, dribbling: 47, defense: 84, keeping: 7 } },
      { id: "sen-ibrahim-mbaye", name: "姆巴耶", number: 20, position: "FW", role: "ST", marketValueM: 10, attributes: { speed: 79, passing: 60, shooting: 87, dribbling: 71, defense: 37, keeping: 10 } },
      { id: "sen-habib-diarra", name: "迪亚拉", number: 21, position: "MF", role: "CM", marketValueM: 20, attributes: { speed: 69, passing: 78, shooting: 59, dribbling: 69, defense: 64, keeping: 4 } },
      { id: "sen-bara-sapoko-ndiaye", name: "巴拉·恩迪亚耶", number: 22, position: "MF", role: "CM", marketValueM: 1, attributes: { speed: 64, passing: 76, shooting: 49, dribbling: 62, defense: 62, keeping: 5 } },
      { id: "sen-mory-diaw", name: "莫里·迪奥", number: 23, position: "GK", role: "GK", marketValueM: 2, attributes: { speed: 51, passing: 60, shooting: 10, dribbling: 34, defense: 49, keeping: 76 } },
      { id: "sen-antoine-mendy", name: "安托万·门迪", number: 24, position: "DF", role: "CB", marketValueM: 2, attributes: { speed: 59, passing: 60, shooting: 33, dribbling: 46, defense: 74, keeping: 10 } },
      { id: "sen-el-hadji-malick-diouf", name: "马利克·迪乌夫", number: 25, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 61, passing: 57, shooting: 33, dribbling: 45, defense: 88, keeping: 6 } },
      { id: "sen-pape-gueye", name: "帕普·盖耶", number: 26, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 66, passing: 80, shooting: 55, dribbling: 70, defense: 66, keeping: 9 } },
    ],
  },
  countryProfile("CMR", "喀麦隆", "Cameroon", "#007a5e", "#ce1126", "4-3-3"),
  countryProfile("COD", "刚果民主共和国", "DR Congo", "#007fff", "#f7d618", "4-2-3-1"),
  {
    ...countryProfile("FRA", "法国", "France", "#1f3f8b", "#ffffff", "4-2-3-1"),
    kit: {
      home: { shirt: "#1f3f8b", trim: "#ffffff", shorts: "#ffffff" },
      away: { shirt: "#ffffff", trim: "#1f3f8b", shorts: "#1f3f8b" },
    },
    starterIds: [
      "fra-brice-samba",
      "fra-malo-gusto",
      "fra-lucas-digne",
      "fra-dayot-upamecano",
      "fra-jules-kounde",
      "fra-manu-kone",
      "fra-ousmane-dembele",
      "fra-aurelien-tchouameni",
      "fra-marcus-thuram",
      "fra-kylian-mbappe",
      "fra-michael-olise",
    ],
    squad: [
      { id: "fra-brice-samba", name: "桑巴", number: 1, position: "GK", role: "GK", marketValueM: 12, attributes: { speed: 49, passing: 54, shooting: 14, dribbling: 37, defense: 54, keeping: 83 } },
      { id: "fra-malo-gusto", name: "古斯托", number: 2, position: "DF", role: "CB", marketValueM: 35, attributes: { speed: 66, passing: 59, shooting: 35, dribbling: 46, defense: 85, keeping: 7 } },
      { id: "fra-lucas-digne", name: "迪涅", number: 3, position: "DF", role: "CB", marketValueM: 9, attributes: { speed: 60, passing: 60, shooting: 34, dribbling: 46, defense: 83, keeping: 9 } },
      { id: "fra-dayot-upamecano", name: "于帕梅卡诺", number: 4, position: "DF", role: "CB", marketValueM: 50, attributes: { speed: 62, passing: 58, shooting: 31, dribbling: 46, defense: 89, keeping: 5 } },
      { id: "fra-jules-kounde", name: "孔德", number: 5, position: "DF", role: "CB", marketValueM: 60, attributes: { speed: 65, passing: 66, shooting: 30, dribbling: 44, defense: 88, keeping: 5 } },
      { id: "fra-manu-kone", name: "科内", number: 6, position: "MF", role: "CM", marketValueM: 35, attributes: { speed: 67, passing: 80, shooting: 54, dribbling: 77, defense: 71, keeping: 4 } },
      { id: "fra-ousmane-dembele", name: "登贝莱", number: 7, position: "FW", role: "ST", marketValueM: 90, attributes: { speed: 87, passing: 67, shooting: 89, dribbling: 79, defense: 31, keeping: 6 } },
      { id: "fra-aurelien-tchouameni", name: "楚阿梅尼", number: 8, position: "MF", role: "CM", marketValueM: 100, attributes: { speed: 69, passing: 85, shooting: 55, dribbling: 73, defense: 68, keeping: 5 } },
      { id: "fra-marcus-thuram", name: "小图拉姆", number: 9, position: "FW", role: "ST", marketValueM: 40, attributes: { speed: 83, passing: 63, shooting: 93, dribbling: 79, defense: 34, keeping: 8 } },
      { id: "fra-kylian-mbappe", name: "姆巴佩", number: 10, position: "FW", role: "ST", marketValueM: 180, attributes: { speed: 81, passing: 66, shooting: 92, dribbling: 85, defense: 36, keeping: 7 } },
      { id: "fra-michael-olise", name: "奥利塞", number: 11, position: "FW", role: "ST", marketValueM: 140, attributes: { speed: 84, passing: 67, shooting: 97, dribbling: 78, defense: 35, keeping: 6 } },
      { id: "fra-bradley-barcola", name: "巴尔科拉", number: 12, position: "FW", role: "ST", marketValueM: 70, attributes: { speed: 81, passing: 65, shooting: 89, dribbling: 77, defense: 39, keeping: 7 } },
      { id: "fra-ngolo-kante", name: "坎特", number: 13, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 64, passing: 82, shooting: 55, dribbling: 72, defense: 61, keeping: 5 } },
      { id: "fra-adrien-rabiot", name: "拉比奥", number: 14, position: "MF", role: "CM", marketValueM: 20, attributes: { speed: 70, passing: 76, shooting: 53, dribbling: 68, defense: 66, keeping: 8 } },
      { id: "fra-ibrahima-konate", name: "科纳特", number: 15, position: "DF", role: "CB", marketValueM: 60, attributes: { speed: 68, passing: 59, shooting: 29, dribbling: 42, defense: 84, keeping: 4 } },
      { id: "fra-mike-maignan", name: "迈尼昂", number: 16, position: "GK", role: "GK", marketValueM: 35, attributes: { speed: 49, passing: 58, shooting: 12, dribbling: 36, defense: 52, keeping: 88 } },
      { id: "fra-william-saliba", name: "萨利巴", number: 17, position: "DF", role: "CB", marketValueM: 80, attributes: { speed: 63, passing: 60, shooting: 34, dribbling: 45, defense: 85, keeping: 4 } },
      { id: "fra-warren-zaire-emery", name: "埃梅里", number: 18, position: "MF", role: "CM", marketValueM: 60, attributes: { speed: 72, passing: 86, shooting: 60, dribbling: 70, defense: 67, keeping: 8 } },
      { id: "fra-theo-hernandez", name: "特奥", number: 19, position: "DF", role: "CB", marketValueM: 50, attributes: { speed: 68, passing: 63, shooting: 34, dribbling: 44, defense: 86, keeping: 8 } },
      { id: "fra-desire-doue", name: "杜埃", number: 20, position: "FW", role: "ST", marketValueM: 90, attributes: { speed: 80, passing: 62, shooting: 93, dribbling: 83, defense: 36, keeping: 4 } },
      { id: "fra-lucas-hernandez", name: "卢卡斯", number: 21, position: "DF", role: "CB", marketValueM: 30, attributes: { speed: 62, passing: 63, shooting: 30, dribbling: 48, defense: 88, keeping: 5 } },
      { id: "fra-jean-philippe-mateta", name: "马特塔", number: 22, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 83, passing: 60, shooting: 87, dribbling: 73, defense: 38, keeping: 9 } },
      { id: "fra-robin-risser", name: "里瑟", number: 23, position: "GK", role: "GK", marketValueM: 5, attributes: { speed: 51, passing: 57, shooting: 8, dribbling: 32, defense: 52, keeping: 84 } },
      { id: "fra-rayan-cherki", name: "切尔基", number: 24, position: "MF", role: "CM", marketValueM: 40, attributes: { speed: 66, passing: 86, shooting: 54, dribbling: 75, defense: 68, keeping: 10 } },
      { id: "fra-maghnes-akliouche", name: "阿克利乌什", number: 25, position: "MF", role: "CM", marketValueM: 35, attributes: { speed: 66, passing: 78, shooting: 52, dribbling: 73, defense: 63, keeping: 6 } },
      { id: "fra-maxence-lacroix", name: "拉克鲁瓦", number: 26, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 67, passing: 65, shooting: 29, dribbling: 48, defense: 80, keeping: 8 } },
    ],
  },
  {
    ...countryProfile("ENG", "英格兰", "England", "#ffffff", "#cf142b", "4-2-3-1"),
    kit: {
      home: { shirt: "#ffffff", trim: "#cf142b", shorts: "#111111" },
      away: { shirt: "#cf142b", trim: "#ffffff", shorts: "#cf142b" },
    },
    starterIds: [
      "eng-jordan-pickford",
      "eng-ezri-konsa",
      "eng-nico-oreilly",
      "eng-declan-rice",
      "eng-john-stones",
      "eng-marc-guehi",
      "eng-bukayo-saka",
      "eng-elliot-anderson",
      "eng-harry-kane",
      "eng-jude-bellingham",
      "eng-marcus-rashford",
    ],
    squad: [
      { id: "eng-jordan-pickford", name: "皮克福德", number: 1, position: "GK", role: "GK", marketValueM: 25, attributes: { speed: 50, passing: 62, shooting: 9, dribbling: 39, defense: 53, keeping: 85 } },
      { id: "eng-ezri-konsa", name: "孔萨", number: 2, position: "DF", role: "CB", marketValueM: 40, attributes: { speed: 62, passing: 58, shooting: 32, dribbling: 46, defense: 89, keeping: 7 } },
      { id: "eng-nico-oreilly", name: "奥赖利", number: 3, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 64, passing: 64, shooting: 31, dribbling: 43, defense: 78, keeping: 9 } },
      { id: "eng-declan-rice", name: "赖斯", number: 4, position: "MF", role: "CM", marketValueM: 120, attributes: { speed: 76, passing: 82, shooting: 58, dribbling: 78, defense: 66, keeping: 10 } },
      { id: "eng-john-stones", name: "斯通斯", number: 5, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 60, passing: 59, shooting: 27, dribbling: 42, defense: 82, keeping: 8 } },
      { id: "eng-marc-guehi", name: "格伊", number: 6, position: "DF", role: "CB", marketValueM: 50, attributes: { speed: 64, passing: 59, shooting: 32, dribbling: 48, defense: 89, keeping: 10 } },
      { id: "eng-bukayo-saka", name: "萨卡", number: 7, position: "FW", role: "ST", marketValueM: 150, attributes: { speed: 84, passing: 65, shooting: 90, dribbling: 82, defense: 34, keeping: 9 } },
      { id: "eng-elliot-anderson", name: "埃利奥特·安德森", number: 8, position: "MF", role: "CM", marketValueM: 35, attributes: { speed: 72, passing: 86, shooting: 55, dribbling: 77, defense: 63, keeping: 10 } },
      { id: "eng-harry-kane", name: "凯恩", number: 9, position: "FW", role: "ST", marketValueM: 65, attributes: { speed: 79, passing: 60, shooting: 89, dribbling: 77, defense: 39, keeping: 9 } },
      { id: "eng-jude-bellingham", name: "贝林厄姆", number: 10, position: "MF", role: "CM", marketValueM: 180, attributes: { speed: 72, passing: 87, shooting: 62, dribbling: 75, defense: 67, keeping: 7 } },
      { id: "eng-marcus-rashford", name: "拉什福德", number: 11, position: "FW", role: "ST", marketValueM: 35, attributes: { speed: 80, passing: 60, shooting: 91, dribbling: 74, defense: 39, keeping: 7 } },
      { id: "eng-trevoh-chalobah", name: "查洛巴", number: 12, position: "DF", role: "CB", marketValueM: 22, attributes: { speed: 59, passing: 62, shooting: 29, dribbling: 44, defense: 79, keeping: 8 } },
      { id: "eng-dean-henderson", name: "迪恩·亨德森", number: 13, position: "GK", role: "GK", marketValueM: 20, attributes: { speed: 53, passing: 58, shooting: 9, dribbling: 37, defense: 49, keeping: 86 } },
      { id: "eng-jordan-henderson", name: "乔丹·亨德森", number: 14, position: "MF", role: "CM", marketValueM: 3, attributes: { speed: 65, passing: 79, shooting: 58, dribbling: 64, defense: 64, keeping: 7 } },
      { id: "eng-dan-burn", name: "丹·伯恩", number: 15, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 62, passing: 60, shooting: 33, dribbling: 40, defense: 84, keeping: 9 } },
      { id: "eng-kobbie-mainoo", name: "梅努", number: 16, position: "MF", role: "CM", marketValueM: 55, attributes: { speed: 75, passing: 79, shooting: 54, dribbling: 70, defense: 68, keeping: 9 } },
      { id: "eng-morgan-rogers", name: "摩根·罗杰斯", number: 17, position: "MF", role: "CM", marketValueM: 60, attributes: { speed: 73, passing: 85, shooting: 60, dribbling: 73, defense: 69, keeping: 6 } },
      { id: "eng-anthony-gordon", name: "安东尼·戈登", number: 18, position: "FW", role: "ST", marketValueM: 55, attributes: { speed: 78, passing: 61, shooting: 90, dribbling: 76, defense: 37, keeping: 6 } },
      { id: "eng-ollie-watkins", name: "沃特金斯", number: 19, position: "FW", role: "ST", marketValueM: 40, attributes: { speed: 83, passing: 58, shooting: 89, dribbling: 80, defense: 37, keeping: 8 } },
      { id: "eng-noni-madueke", name: "马杜埃凯", number: 20, position: "FW", role: "ST", marketValueM: 40, attributes: { speed: 85, passing: 58, shooting: 86, dribbling: 77, defense: 37, keeping: 4 } },
      { id: "eng-eberechi-eze", name: "埃泽", number: 21, position: "MF", role: "CM", marketValueM: 55, attributes: { speed: 71, passing: 80, shooting: 54, dribbling: 77, defense: 69, keeping: 10 } },
      { id: "eng-ivan-toney", name: "伊万·托尼", number: 22, position: "FW", role: "ST", marketValueM: 20, attributes: { speed: 79, passing: 60, shooting: 88, dribbling: 78, defense: 32, keeping: 9 } },
      { id: "eng-james-trafford", name: "特拉福德", number: 23, position: "GK", role: "GK", marketValueM: 20, attributes: { speed: 47, passing: 60, shooting: 10, dribbling: 34, defense: 54, keeping: 85 } },
      { id: "eng-reece-james", name: "里斯·詹姆斯", number: 24, position: "DF", role: "CB", marketValueM: 35, attributes: { speed: 62, passing: 61, shooting: 33, dribbling: 43, defense: 83, keeping: 7 } },
      { id: "eng-djed-spence", name: "斯彭斯", number: 25, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 60, passing: 60, shooting: 28, dribbling: 47, defense: 84, keeping: 6 } },
      { id: "eng-jarell-quansah", name: "宽萨", number: 26, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 61, passing: 61, shooting: 27, dribbling: 47, defense: 80, keeping: 7 } },
    ],
  },
  {
    ...countryProfile("GER", "德国", "Germany", "#ffffff", "#111111", "4-2-3-1"),
    kit: {
      home: { shirt: "#ffffff", trim: "#111111", shorts: "#111111" },
      away: { shirt: "#111111", trim: "#ffffff", shorts: "#111111" },
    },
    starterIds: [
      "ger-manuel-neuer",
      "ger-antonio-ruediger",
      "ger-waldemar-anton",
      "ger-jonathan-tah",
      "ger-aleksandar-pavlovic",
      "ger-joshua-kimmich",
      "ger-kai-havertz",
      "ger-leon-goretzka",
      "ger-jamie-leweling",
      "ger-jamal-musiala",
      "ger-nick-woltemade",
    ],
    squad: [
      { id: "ger-manuel-neuer", name: "诺伊尔", number: 1, position: "GK", role: "GK", marketValueM: 4, attributes: { speed: 47, passing: 52, shooting: 9, dribbling: 33, defense: 55, keeping: 76 } },
      { id: "ger-antonio-ruediger", name: "吕迪格", number: 2, position: "DF", role: "CB", marketValueM: 20, attributes: { speed: 64, passing: 64, shooting: 35, dribbling: 47, defense: 85, keeping: 10 } },
      { id: "ger-waldemar-anton", name: "安东", number: 3, position: "DF", role: "CB", marketValueM: 18, attributes: { speed: 60, passing: 63, shooting: 32, dribbling: 44, defense: 79, keeping: 7 } },
      { id: "ger-jonathan-tah", name: "塔", number: 4, position: "DF", role: "CB", marketValueM: 30, attributes: { speed: 68, passing: 57, shooting: 34, dribbling: 47, defense: 80, keeping: 10 } },
      { id: "ger-aleksandar-pavlovic", name: "帕夫洛维奇", number: 5, position: "MF", role: "CM", marketValueM: 75, attributes: { speed: 68, passing: 86, shooting: 59, dribbling: 74, defense: 66, keeping: 10 } },
      { id: "ger-joshua-kimmich", name: "基米希", number: 6, position: "DF", role: "CB", marketValueM: 50, attributes: { speed: 64, passing: 64, shooting: 28, dribbling: 46, defense: 88, keeping: 8 } },
      { id: "ger-kai-havertz", name: "哈弗茨", number: 7, position: "FW", role: "ST", marketValueM: 65, attributes: { speed: 80, passing: 67, shooting: 90, dribbling: 80, defense: 37, keeping: 7 } },
      { id: "ger-leon-goretzka", name: "格雷茨卡", number: 8, position: "MF", role: "CM", marketValueM: 18, attributes: { speed: 71, passing: 77, shooting: 54, dribbling: 73, defense: 63, keeping: 9 } },
      { id: "ger-jamie-leweling", name: "勒韦林", number: 9, position: "MF", role: "CM", marketValueM: 22, attributes: { speed: 66, passing: 80, shooting: 59, dribbling: 70, defense: 65, keeping: 8 } },
      { id: "ger-jamal-musiala", name: "穆西亚拉", number: 10, position: "MF", role: "CM", marketValueM: 120, attributes: { speed: 76, passing: 83, shooting: 54, dribbling: 74, defense: 69, keeping: 10 } },
      { id: "ger-nick-woltemade", name: "沃尔特马德", number: 11, position: "FW", role: "ST", marketValueM: 65, attributes: { speed: 80, passing: 61, shooting: 88, dribbling: 81, defense: 38, keeping: 10 } },
      { id: "ger-oliver-baumann", name: "鲍曼", number: 12, position: "GK", role: "GK", marketValueM: 3, attributes: { speed: 51, passing: 52, shooting: 15, dribbling: 33, defense: 48, keeping: 82 } },
      { id: "ger-pascal-gross", name: "格罗斯", number: 13, position: "MF", role: "CM", marketValueM: 7, attributes: { speed: 69, passing: 76, shooting: 50, dribbling: 66, defense: 61, keeping: 9 } },
      { id: "ger-maximilian-beier", name: "拜尔", number: 14, position: "FW", role: "ST", marketValueM: 35, attributes: { speed: 80, passing: 64, shooting: 88, dribbling: 77, defense: 32, keeping: 5 } },
      { id: "ger-nico-schlotterbeck", name: "施洛特贝克", number: 15, position: "DF", role: "CB", marketValueM: 40, attributes: { speed: 63, passing: 64, shooting: 28, dribbling: 41, defense: 81, keeping: 4 } },
      { id: "ger-angelo-stiller", name: "斯蒂勒", number: 16, position: "MF", role: "CM", marketValueM: 35, attributes: { speed: 72, passing: 79, shooting: 60, dribbling: 71, defense: 71, keeping: 6 } },
      { id: "ger-florian-wirtz", name: "维尔茨", number: 17, position: "MF", role: "CM", marketValueM: 140, attributes: { speed: 75, passing: 86, shooting: 56, dribbling: 76, defense: 67, keeping: 4 } },
      { id: "ger-nathaniel-brown", name: "布朗", number: 18, position: "DF", role: "CB", marketValueM: 18, attributes: { speed: 66, passing: 62, shooting: 32, dribbling: 44, defense: 79, keeping: 9 } },
      { id: "ger-leroy-sane", name: "萨内", number: 19, position: "MF", role: "CM", marketValueM: 28, attributes: { speed: 67, passing: 78, shooting: 55, dribbling: 74, defense: 70, keeping: 10 } },
      { id: "ger-nadiem-amiri", name: "阿米里", number: 20, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 67, passing: 75, shooting: 54, dribbling: 74, defense: 61, keeping: 10 } },
      { id: "ger-alexander-nuebel", name: "努贝尔", number: 21, position: "GK", role: "GK", marketValueM: 8, attributes: { speed: 53, passing: 59, shooting: 11, dribbling: 37, defense: 50, keeping: 83 } },
      { id: "ger-david-raum", name: "劳姆", number: 22, position: "DF", role: "CB", marketValueM: 20, attributes: { speed: 66, passing: 59, shooting: 35, dribbling: 44, defense: 83, keeping: 7 } },
      { id: "ger-felix-nmecha", name: "恩梅查", number: 23, position: "MF", role: "CM", marketValueM: 25, attributes: { speed: 71, passing: 79, shooting: 60, dribbling: 70, defense: 67, keeping: 5 } },
      { id: "ger-malick-thiaw", name: "佳夫", number: 24, position: "DF", role: "CB", marketValueM: 30, attributes: { speed: 68, passing: 60, shooting: 30, dribbling: 42, defense: 80, keeping: 4 } },
      { id: "ger-assan-ouedraogo", name: "韦德拉奥果", number: 25, position: "MF", role: "CM", marketValueM: 15, attributes: { speed: 73, passing: 80, shooting: 58, dribbling: 69, defense: 65, keeping: 4 } },
      { id: "ger-deniz-undav", name: "翁达夫", number: 26, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 82, passing: 58, shooting: 84, dribbling: 76, defense: 35, keeping: 5 } },
    ],
  },
  {
    ...countryProfile("NED", "荷兰", "Netherlands", "#f36c21", "#ffffff", "4-3-3"),
    kit: {
      home: { shirt: "#f36c21", trim: "#ffffff", shorts: "#f36c21" },
      away: { shirt: "#1f2937", trim: "#f36c21", shorts: "#1f2937" },
    },
    starterIds: [
      "ned-bart-verbruggen",
      "ned-lutsharel-geertruida",
      "ned-marten-de-roon",
      "ned-virgil-van-dijk",
      "ned-nathan-ake",
      "ned-jan-paul-van-hecke",
      "ned-justin-kluivert",
      "ned-ryan-gravenberch",
      "ned-wout-weghorst",
      "ned-memphis-depay",
      "ned-cody-gakpo",
    ],
    squad: [
      { id: "ned-bart-verbruggen", name: "费布鲁亨", number: 1, position: "GK", role: "GK", marketValueM: 30, attributes: { speed: 52, passing: 55, shooting: 17, dribbling: 37, defense: 56, keeping: 84 } },
      { id: "ned-lutsharel-geertruida", name: "海特勒伊达", number: 2, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 63, passing: 58, shooting: 27, dribbling: 41, defense: 83, keeping: 8 } },
      { id: "ned-marten-de-roon", name: "德容恩", number: 3, position: "MF", role: "CM", marketValueM: 4, attributes: { speed: 70, passing: 79, shooting: 55, dribbling: 67, defense: 64, keeping: 10 } },
      { id: "ned-virgil-van-dijk", name: "范戴克", number: 4, position: "DF", role: "CB", marketValueM: 28, attributes: { speed: 63, passing: 59, shooting: 30, dribbling: 44, defense: 80, keeping: 5 } },
      { id: "ned-nathan-ake", name: "阿克", number: 5, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 60, passing: 64, shooting: 34, dribbling: 41, defense: 84, keeping: 10 } },
      { id: "ned-jan-paul-van-hecke", name: "范赫克", number: 6, position: "DF", role: "CB", marketValueM: 30, attributes: { speed: 60, passing: 60, shooting: 35, dribbling: 46, defense: 85, keeping: 5 } },
      { id: "ned-justin-kluivert", name: "小克鲁伊维特", number: 7, position: "MF", role: "CM", marketValueM: 20, attributes: { speed: 73, passing: 82, shooting: 51, dribbling: 70, defense: 68, keeping: 4 } },
      { id: "ned-ryan-gravenberch", name: "赫拉芬贝赫", number: 8, position: "MF", role: "CM", marketValueM: 75, attributes: { speed: 67, passing: 82, shooting: 54, dribbling: 76, defense: 72, keeping: 6 } },
      { id: "ned-wout-weghorst", name: "韦霍斯特", number: 9, position: "FW", role: "ST", marketValueM: 3, attributes: { speed: 77, passing: 61, shooting: 82, dribbling: 75, defense: 31, keeping: 6 } },
      { id: "ned-memphis-depay", name: "德佩", number: 10, position: "FW", role: "ST", marketValueM: 12, attributes: { speed: 78, passing: 65, shooting: 81, dribbling: 73, defense: 31, keeping: 4 } },
      { id: "ned-cody-gakpo", name: "加克波", number: 11, position: "FW", role: "ST", marketValueM: 65, attributes: { speed: 81, passing: 65, shooting: 95, dribbling: 79, defense: 36, keeping: 5 } },
      { id: "ned-mats-wieffer", name: "魏费尔", number: 12, position: "DF", role: "CB", marketValueM: 20, attributes: { speed: 59, passing: 60, shooting: 35, dribbling: 48, defense: 87, keeping: 6 } },
      { id: "ned-robin-roefs", name: "鲁夫斯", number: 13, position: "GK", role: "GK", marketValueM: 12, attributes: { speed: 51, passing: 59, shooting: 13, dribbling: 37, defense: 50, keeping: 81 } },
      { id: "ned-tijjani-reijnders", name: "赖因德斯", number: 14, position: "MF", role: "CM", marketValueM: 55, attributes: { speed: 67, passing: 85, shooting: 57, dribbling: 76, defense: 71, keeping: 4 } },
      { id: "ned-micky-van-de-ven", name: "范德文", number: 15, position: "DF", role: "CB", marketValueM: 55, attributes: { speed: 61, passing: 59, shooting: 29, dribbling: 44, defense: 82, keeping: 4 } },
      { id: "ned-guus-til", name: "古斯·蒂尔", number: 16, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 66, passing: 78, shooting: 52, dribbling: 66, defense: 65, keeping: 7 } },
      { id: "ned-noa-lang", name: "诺阿·朗", number: 17, position: "FW", role: "ST", marketValueM: 20, attributes: { speed: 79, passing: 65, shooting: 84, dribbling: 72, defense: 39, keeping: 6 } },
      { id: "ned-donyell-malen", name: "马伦", number: 18, position: "FW", role: "ST", marketValueM: 28, attributes: { speed: 81, passing: 62, shooting: 92, dribbling: 78, defense: 36, keeping: 5 } },
      { id: "ned-brian-brobbey", name: "布罗贝伊", number: 19, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 79, passing: 66, shooting: 90, dribbling: 78, defense: 31, keeping: 4 } },
      { id: "ned-teun-koopmeiners", name: "库普梅纳斯", number: 20, position: "MF", role: "CM", marketValueM: 35, attributes: { speed: 71, passing: 86, shooting: 58, dribbling: 73, defense: 67, keeping: 4 } },
      { id: "ned-frenkie-de-jong", name: "弗朗基·德容", number: 21, position: "MF", role: "CM", marketValueM: 45, attributes: { speed: 75, passing: 83, shooting: 59, dribbling: 73, defense: 71, keeping: 10 } },
      { id: "ned-denzel-dumfries", name: "邓弗里斯", number: 22, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 66, passing: 63, shooting: 34, dribbling: 40, defense: 85, keeping: 5 } },
      { id: "ned-mark-flekken", name: "弗莱肯", number: 23, position: "GK", role: "GK", marketValueM: 8, attributes: { speed: 47, passing: 61, shooting: 13, dribbling: 34, defense: 53, keeping: 81 } },
      { id: "ned-crysencio-summerville", name: "萨默维尔", number: 24, position: "FW", role: "ST", marketValueM: 22, attributes: { speed: 81, passing: 63, shooting: 87, dribbling: 72, defense: 37, keeping: 9 } },
      { id: "ned-jorrel-hato", name: "哈托", number: 25, position: "DF", role: "CB", marketValueM: 40, attributes: { speed: 67, passing: 59, shooting: 35, dribbling: 44, defense: 84, keeping: 8 } },
      { id: "ned-quinten-timber", name: "廷伯", number: 26, position: "MF", role: "CM", marketValueM: 28, attributes: { speed: 71, passing: 77, shooting: 54, dribbling: 75, defense: 69, keeping: 7 } },
    ],
  },
  {
    ...countryProfile("POR", "葡萄牙", "Portugal", "#cf142b", "#006600", "4-3-3"),
    kit: {
      home: { shirt: "#cf142b", trim: "#006600", shorts: "#cf142b" },
      away: { shirt: "#ffffff", trim: "#006600", shorts: "#ffffff" },
    },
    starterIds: [
      "por-diogo-costa",
      "por-nelson-semedo",
      "por-ruben-dias",
      "por-tomas-araujo",
      "por-diogo-dalot",
      "por-matheus-nunes",
      "por-cristiano-ronaldo",
      "por-bruno-fernandes",
      "por-goncalo-ramos",
      "por-bernardo-silva",
      "por-joao-felix",
    ],
    squad: [
      { id: "por-diogo-costa", name: "迪奥戈·科斯塔", number: 1, position: "GK", role: "GK", marketValueM: 45, attributes: { speed: 55, passing: 62, shooting: 10, dribbling: 37, defense: 55, keeping: 91 } },
      { id: "por-nelson-semedo", name: "塞梅多", number: 2, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 65, passing: 59, shooting: 28, dribbling: 46, defense: 77, keeping: 5 } },
      { id: "por-ruben-dias", name: "鲁本·迪亚斯", number: 3, position: "DF", role: "CB", marketValueM: 75, attributes: { speed: 64, passing: 60, shooting: 31, dribbling: 44, defense: 86, keeping: 5 } },
      { id: "por-tomas-araujo", name: "托马斯·阿劳霍", number: 4, position: "DF", role: "CB", marketValueM: 30, attributes: { speed: 60, passing: 63, shooting: 29, dribbling: 46, defense: 80, keeping: 4 } },
      { id: "por-diogo-dalot", name: "达洛特", number: 5, position: "DF", role: "CB", marketValueM: 40, attributes: { speed: 62, passing: 57, shooting: 28, dribbling: 49, defense: 81, keeping: 8 } },
      { id: "por-matheus-nunes", name: "努内斯", number: 6, position: "MF", role: "CM", marketValueM: 40, attributes: { speed: 74, passing: 80, shooting: 59, dribbling: 74, defense: 65, keeping: 4 } },
      { id: "por-cristiano-ronaldo", name: "C罗", number: 7, position: "FW", role: "ST", marketValueM: 12, attributes: { speed: 79, passing: 62, shooting: 81, dribbling: 71, defense: 31, keeping: 4 } },
      { id: "por-bruno-fernandes", name: "B费", number: 8, position: "MF", role: "CM", marketValueM: 50, attributes: { speed: 75, passing: 82, shooting: 60, dribbling: 73, defense: 71, keeping: 8 } },
      { id: "por-goncalo-ramos", name: "贡萨洛·拉莫斯", number: 9, position: "FW", role: "ST", marketValueM: 40, attributes: { speed: 83, passing: 59, shooting: 92, dribbling: 73, defense: 33, keeping: 8 } },
      { id: "por-bernardo-silva", name: "B席", number: 10, position: "MF", role: "CM", marketValueM: 38, attributes: { speed: 69, passing: 86, shooting: 56, dribbling: 75, defense: 69, keeping: 5 } },
      { id: "por-joao-felix", name: "菲利克斯", number: 11, position: "FW", role: "ST", marketValueM: 20, attributes: { speed: 81, passing: 63, shooting: 88, dribbling: 78, defense: 33, keeping: 7 } },
      { id: "por-jose-sa", name: "若泽·萨", number: 12, position: "GK", role: "GK", marketValueM: 8, attributes: { speed: 51, passing: 60, shooting: 11, dribbling: 40, defense: 54, keeping: 84 } },
      { id: "por-renato-veiga", name: "维加", number: 13, position: "DF", role: "CB", marketValueM: 30, attributes: { speed: 68, passing: 57, shooting: 34, dribbling: 43, defense: 81, keeping: 4 } },
      { id: "por-goncalo-inacio", name: "伊纳西奥", number: 14, position: "DF", role: "CB", marketValueM: 45, attributes: { speed: 66, passing: 62, shooting: 30, dribbling: 47, defense: 87, keeping: 4 } },
      { id: "por-joao-neves", name: "若昂·内维斯", number: 15, position: "MF", role: "CM", marketValueM: 80, attributes: { speed: 71, passing: 87, shooting: 55, dribbling: 72, defense: 70, keeping: 5 } },
      { id: "por-francisco-trincao", name: "特林康", number: 16, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 82, passing: 59, shooting: 85, dribbling: 80, defense: 34, keeping: 5 } },
      { id: "por-rafael-leao", name: "莱奥", number: 17, position: "FW", role: "ST", marketValueM: 75, attributes: { speed: 80, passing: 67, shooting: 92, dribbling: 81, defense: 39, keeping: 9 } },
      { id: "por-pedro-neto", name: "内托", number: 18, position: "FW", role: "ST", marketValueM: 55, attributes: { speed: 81, passing: 64, shooting: 91, dribbling: 78, defense: 33, keeping: 8 } },
      { id: "por-goncalo-guedes", name: "格德斯", number: 19, position: "FW", role: "ST", marketValueM: 8, attributes: { speed: 78, passing: 59, shooting: 83, dribbling: 72, defense: 33, keeping: 6 } },
      { id: "por-joao-cancelo", name: "坎塞洛", number: 20, position: "DF", role: "CB", marketValueM: 20, attributes: { speed: 64, passing: 58, shooting: 27, dribbling: 43, defense: 86, keeping: 6 } },
      { id: "por-ruben-neves", name: "鲁本·内维斯", number: 21, position: "MF", role: "CM", marketValueM: 28, attributes: { speed: 71, passing: 80, shooting: 60, dribbling: 69, defense: 68, keeping: 7 } },
      { id: "por-rui-silva", name: "鲁伊·席尔瓦", number: 22, position: "GK", role: "GK", marketValueM: 8, attributes: { speed: 50, passing: 56, shooting: 12, dribbling: 35, defense: 55, keeping: 85 } },
      { id: "por-vitinha", name: "维蒂尼亚", number: 23, position: "MF", role: "CM", marketValueM: 80, attributes: { speed: 72, passing: 85, shooting: 56, dribbling: 77, defense: 67, keeping: 4 } },
      { id: "por-samu-costa", name: "萨穆·科斯塔", number: 24, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 60, passing: 57, shooting: 27, dribbling: 41, defense: 86, keeping: 6 } },
      { id: "por-nuno-mendes", name: "努诺·门德斯", number: 25, position: "DF", role: "CB", marketValueM: 70, attributes: { speed: 65, passing: 65, shooting: 33, dribbling: 46, defense: 85, keeping: 5 } },
      { id: "por-francisco-conceicao", name: "小孔塞桑", number: 26, position: "FW", role: "ST", marketValueM: 35, attributes: { speed: 78, passing: 59, shooting: 87, dribbling: 74, defense: 35, keeping: 9 } },
    ],
  },
  {
    ...countryProfile("BEL", "比利时", "Belgium", "#ed2939", "#ffde00", "3-4-2-1"),
    kit: {
      home: { shirt: "#ed2939", trim: "#ffde00", shorts: "#111111" },
      away: { shirt: "#ffffff", trim: "#ed2939", shorts: "#ffffff" },
    },
    starterIds: [
      "bel-thibaut-courtois",
      "bel-zeno-debast",
      "bel-arthur-theate",
      "bel-brandon-mechele",
      "bel-maxim-de-cuyper",
      "bel-axel-witsel",
      "bel-kevin-de-bruyne",
      "bel-youri-tielemans",
      "bel-romelu-lukaku",
      "bel-leandro-trossard",
      "bel-jeremy-doku",
    ],
    squad: [
      { id: "bel-thibaut-courtois", name: "库尔图瓦", number: 1, position: "GK", role: "GK", marketValueM: 20, attributes: { speed: 49, passing: 59, shooting: 16, dribbling: 38, defense: 50, keeping: 82 } },
      { id: "bel-zeno-debast", name: "德巴斯特", number: 2, position: "DF", role: "CB", marketValueM: 20, attributes: { speed: 59, passing: 62, shooting: 34, dribbling: 42, defense: 82, keeping: 8 } },
      { id: "bel-arthur-theate", name: "泰特", number: 3, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 67, passing: 59, shooting: 30, dribbling: 43, defense: 85, keeping: 7 } },
      { id: "bel-brandon-mechele", name: "梅赫勒", number: 4, position: "DF", role: "CB", marketValueM: 2, attributes: { speed: 58, passing: 54, shooting: 26, dribbling: 43, defense: 72, keeping: 9 } },
      { id: "bel-maxim-de-cuyper", name: "德凯珀", number: 5, position: "DF", role: "CB", marketValueM: 25, attributes: { speed: 60, passing: 57, shooting: 33, dribbling: 42, defense: 88, keeping: 8 } },
      { id: "bel-axel-witsel", name: "维特塞尔", number: 6, position: "MF", role: "CM", marketValueM: 2, attributes: { speed: 68, passing: 78, shooting: 51, dribbling: 71, defense: 61, keeping: 5 } },
      { id: "bel-kevin-de-bruyne", name: "德布劳内", number: 7, position: "MF", role: "CM", marketValueM: 20, attributes: { speed: 72, passing: 76, shooting: 53, dribbling: 71, defense: 68, keeping: 9 } },
      { id: "bel-youri-tielemans", name: "蒂勒曼斯", number: 8, position: "MF", role: "CM", marketValueM: 20, attributes: { speed: 70, passing: 81, shooting: 54, dribbling: 73, defense: 62, keeping: 5 } },
      { id: "bel-romelu-lukaku", name: "卢卡库", number: 9, position: "FW", role: "ST", marketValueM: 15, attributes: { speed: 81, passing: 62, shooting: 88, dribbling: 74, defense: 32, keeping: 10 } },
      { id: "bel-leandro-trossard", name: "特罗萨德", number: 10, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 78, passing: 61, shooting: 88, dribbling: 75, defense: 39, keeping: 10 } },
      { id: "bel-jeremy-doku", name: "多库", number: 11, position: "FW", role: "ST", marketValueM: 60, attributes: { speed: 80, passing: 59, shooting: 86, dribbling: 77, defense: 38, keeping: 10 } },
      { id: "bel-senne-lammens", name: "拉门斯", number: 12, position: "GK", role: "GK", marketValueM: 20, attributes: { speed: 47, passing: 56, shooting: 10, dribbling: 34, defense: 49, keeping: 90 } },
      { id: "bel-mike-penders", name: "彭德斯", number: 13, position: "GK", role: "GK", marketValueM: 15, attributes: { speed: 52, passing: 58, shooting: 9, dribbling: 40, defense: 50, keeping: 82 } },
      { id: "bel-dodi-lukebakio", name: "卢克巴基奥", number: 14, position: "FW", role: "ST", marketValueM: 18, attributes: { speed: 81, passing: 61, shooting: 83, dribbling: 77, defense: 36, keeping: 9 } },
      { id: "bel-thomas-meunier", name: "默尼耶", number: 15, position: "DF", role: "CB", marketValueM: 1.5, attributes: { speed: 63, passing: 58, shooting: 32, dribbling: 44, defense: 71, keeping: 4 } },
      { id: "bel-koni-de-winter", name: "德温特", number: 16, position: "DF", role: "CB", marketValueM: 18, attributes: { speed: 65, passing: 59, shooting: 29, dribbling: 40, defense: 86, keeping: 10 } },
      { id: "bel-charles-de-ketelaere", name: "德凯特拉雷", number: 17, position: "FW", role: "ST", marketValueM: 40, attributes: { speed: 84, passing: 61, shooting: 90, dribbling: 75, defense: 36, keeping: 5 } },
      { id: "bel-joaquin-seys", name: "塞斯", number: 18, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 64, passing: 60, shooting: 32, dribbling: 48, defense: 83, keeping: 5 } },
      { id: "bel-diego-moreira", name: "莫雷拉", number: 19, position: "MF", role: "CM", marketValueM: 15, attributes: { speed: 68, passing: 81, shooting: 51, dribbling: 71, defense: 66, keeping: 9 } },
      { id: "bel-hans-vanaken", name: "瓦纳肯", number: 20, position: "MF", role: "CM", marketValueM: 5, attributes: { speed: 65, passing: 78, shooting: 51, dribbling: 69, defense: 67, keeping: 9 } },
      { id: "bel-timothy-castagne", name: "卡斯塔涅", number: 21, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 67, passing: 64, shooting: 30, dribbling: 42, defense: 79, keeping: 9 } },
      { id: "bel-alexis-saelemaekers", name: "萨勒马克尔斯", number: 22, position: "MF", role: "CM", marketValueM: 20, attributes: { speed: 70, passing: 83, shooting: 59, dribbling: 71, defense: 70, keeping: 7 } },
      { id: "bel-nicolas-raskin", name: "拉斯金", number: 23, position: "MF", role: "CM", marketValueM: 12, attributes: { speed: 71, passing: 80, shooting: 51, dribbling: 66, defense: 69, keeping: 5 } },
      { id: "bel-amadou-onana", name: "奥纳纳", number: 24, position: "MF", role: "CM", marketValueM: 50, attributes: { speed: 72, passing: 81, shooting: 60, dribbling: 73, defense: 71, keeping: 8 } },
      { id: "bel-nathan-ngoy", name: "恩戈伊", number: 25, position: "DF", role: "CB", marketValueM: 5, attributes: { speed: 58, passing: 56, shooting: 28, dribbling: 40, defense: 74, keeping: 10 } },
      { id: "bel-matias-fernandez-pardo", name: "费尔南德斯-帕尔多", number: 26, position: "FW", role: "ST", marketValueM: 12, attributes: { speed: 79, passing: 65, shooting: 81, dribbling: 75, defense: 32, keeping: 4 } },
    ],
  },
  {
    ...countryProfile("CRO", "克罗地亚", "Croatia", "#d00000", "#ffffff", "4-3-3"),
    kit: {
      home: { shirt: "#ffffff", trim: "#d00000", shorts: "#1d3f8f" },
      away: { shirt: "#1d3f8f", trim: "#d00000", shorts: "#1d3f8f" },
    },
    starterIds: [
      "cro-dominik-livakovic",
      "cro-josip-stanisic",
      "cro-marin-pongracic",
      "cro-josko-gvardiol",
      "cro-duje-caleta-car",
      "cro-josip-sutalo",
      "cro-nikola-moro",
      "cro-mateo-kovacic",
      "cro-andrej-kramaric",
      "cro-luka-modric",
      "cro-ante-budimir",
    ],
    squad: [
      { id: "cro-dominik-livakovic", name: "利瓦科维奇", number: 1, position: "GK", role: "GK", marketValueM: 10, attributes: { speed: 53, passing: 56, shooting: 8, dribbling: 39, defense: 51, keeping: 86 } },
      { id: "cro-josip-stanisic", name: "斯塔尼希奇", number: 2, position: "DF", role: "CB", marketValueM: 35, attributes: { speed: 68, passing: 57, shooting: 27, dribbling: 49, defense: 88, keeping: 4 } },
      { id: "cro-marin-pongracic", name: "庞格拉契奇", number: 3, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 62, passing: 59, shooting: 29, dribbling: 44, defense: 77, keeping: 5 } },
      { id: "cro-josko-gvardiol", name: "格瓦迪奥尔", number: 4, position: "DF", role: "CB", marketValueM: 75, attributes: { speed: 61, passing: 65, shooting: 32, dribbling: 41, defense: 90, keeping: 10 } },
      { id: "cro-duje-caleta-car", name: "查莱塔-卡尔", number: 5, position: "DF", role: "CB", marketValueM: 7, attributes: { speed: 58, passing: 55, shooting: 34, dribbling: 44, defense: 83, keeping: 8 } },
      { id: "cro-josip-sutalo", name: "舒塔洛", number: 6, position: "DF", role: "CB", marketValueM: 18, attributes: { speed: 60, passing: 57, shooting: 33, dribbling: 42, defense: 86, keeping: 10 } },
      { id: "cro-nikola-moro", name: "莫罗", number: 7, position: "MF", role: "CM", marketValueM: 6, attributes: { speed: 66, passing: 79, shooting: 56, dribbling: 69, defense: 68, keeping: 6 } },
      { id: "cro-mateo-kovacic", name: "科瓦契奇", number: 8, position: "MF", role: "CM", marketValueM: 22, attributes: { speed: 72, passing: 82, shooting: 55, dribbling: 72, defense: 62, keeping: 7 } },
      { id: "cro-andrej-kramaric", name: "克拉马里奇", number: 9, position: "FW", role: "ST", marketValueM: 5, attributes: { speed: 75, passing: 64, shooting: 80, dribbling: 72, defense: 37, keeping: 6 } },
      { id: "cro-luka-modric", name: "莫德里奇", number: 10, position: "MF", role: "CM", marketValueM: 5, attributes: { speed: 63, passing: 78, shooting: 57, dribbling: 65, defense: 68, keeping: 9 } },
      { id: "cro-ante-budimir", name: "布迪米尔", number: 11, position: "FW", role: "ST", marketValueM: 5, attributes: { speed: 74, passing: 60, shooting: 82, dribbling: 74, defense: 38, keeping: 6 } },
      { id: "cro-ivor-pandur", name: "潘杜尔", number: 12, position: "GK", role: "GK", marketValueM: 5, attributes: { speed: 50, passing: 55, shooting: 12, dribbling: 38, defense: 52, keeping: 78 } },
      { id: "cro-nikola-vlasic", name: "弗拉希奇", number: 13, position: "MF", role: "CM", marketValueM: 8, attributes: { speed: 69, passing: 81, shooting: 53, dribbling: 68, defense: 60, keeping: 7 } },
      { id: "cro-ivan-perisic", name: "佩里希奇", number: 14, position: "FW", role: "ST", marketValueM: 2, attributes: { speed: 77, passing: 63, shooting: 78, dribbling: 75, defense: 30, keeping: 6 } },
      { id: "cro-mario-pasalic", name: "帕沙利奇", number: 15, position: "MF", role: "CM", marketValueM: 10, attributes: { speed: 72, passing: 81, shooting: 56, dribbling: 68, defense: 68, keeping: 5 } },
      { id: "cro-martin-baturina", name: "巴图里纳", number: 16, position: "MF", role: "CM", marketValueM: 22, attributes: { speed: 70, passing: 82, shooting: 57, dribbling: 75, defense: 66, keeping: 4 } },
      { id: "cro-petar-sucic", name: "佩塔尔·苏契奇", number: 17, position: "MF", role: "CM", marketValueM: 22, attributes: { speed: 72, passing: 80, shooting: 53, dribbling: 76, defense: 63, keeping: 9 } },
      { id: "cro-kristijan-jakic", name: "亚基奇", number: 18, position: "DF", role: "CB", marketValueM: 8, attributes: { speed: 58, passing: 60, shooting: 31, dribbling: 46, defense: 79, keeping: 8 } },
      { id: "cro-toni-fruk", name: "弗鲁克", number: 19, position: "MF", role: "CM", marketValueM: 8, attributes: { speed: 71, passing: 80, shooting: 54, dribbling: 70, defense: 67, keeping: 6 } },
      { id: "cro-igor-matanovic", name: "马塔诺维奇", number: 20, position: "FW", role: "ST", marketValueM: 8, attributes: { speed: 77, passing: 62, shooting: 85, dribbling: 76, defense: 32, keeping: 5 } },
      { id: "cro-luka-sucic", name: "卢卡·苏契奇", number: 21, position: "MF", role: "CM", marketValueM: 20, attributes: { speed: 68, passing: 84, shooting: 52, dribbling: 76, defense: 67, keeping: 6 } },
      { id: "cro-luka-vuskovic", name: "武什科维奇", number: 22, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 64, passing: 64, shooting: 27, dribbling: 41, defense: 81, keeping: 8 } },
      { id: "cro-dominik-kotarski", name: "科塔尔斯基", number: 23, position: "GK", role: "GK", marketValueM: 6, attributes: { speed: 48, passing: 59, shooting: 8, dribbling: 37, defense: 54, keeping: 78 } },
      { id: "cro-marco-pasalic", name: "马尔科·帕沙利奇", number: 24, position: "FW", role: "ST", marketValueM: 7, attributes: { speed: 75, passing: 63, shooting: 84, dribbling: 72, defense: 36, keeping: 8 } },
      { id: "cro-martin-erlic", name: "埃尔利奇", number: 25, position: "DF", role: "CB", marketValueM: 4, attributes: { speed: 60, passing: 59, shooting: 28, dribbling: 43, defense: 75, keeping: 4 } },
      { id: "cro-petar-musa", name: "穆萨", number: 26, position: "FW", role: "ST", marketValueM: 7, attributes: { speed: 79, passing: 56, shooting: 80, dribbling: 77, defense: 38, keeping: 10 } },
    ],
  },
  countryProfile("AUT", "奥地利", "Austria", "#ef3340", "#ffffff", "4-2-3-1"),
  countryProfile("NOR", "挪威", "Norway", "#ba0c2f", "#00205b", "4-3-3"),
  countryProfile("SCO", "苏格兰", "Scotland", "#005eb8", "#ffffff", "3-4-2-1"),
  countryProfile("TUR", "土耳其", "Turkey", "#e30a17", "#ffffff", "4-2-3-1"),
  countryProfile("CZE", "捷克", "Czech Republic", "#d7141a", "#11457e", "4-2-3-1"),
  {
    ...countryProfile("ESP", "西班牙", "Spain", "#c81e1e", "#ffd23f", "4-3-3"),
    starterIds: [
      "esp-raya",
      "esp-pubill",
      "esp-grimaldo",
      "esp-eric-garcia",
      "esp-llorente",
      "esp-merino",
      "esp-ferran",
      "esp-fabian-ruiz",
      "esp-gavi",
      "esp-olmo",
      "esp-yeremy-pino",
    ],
    squad: [
      { id: "esp-raya", name: "大卫·拉亚", number: 1, position: "GK", role: "GK", marketValueM: 40, attributes: { speed: 50, passing: 58, shooting: 11, dribbling: 34, defense: 55, keeping: 86 } },
      { id: "esp-pubill", name: "马克·普比尔", number: 2, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 60, passing: 58, shooting: 29, dribbling: 45, defense: 81, keeping: 8 } },
      { id: "esp-grimaldo", name: "格里马尔多", number: 3, position: "DF", role: "CB", marketValueM: 35, attributes: { speed: 68, passing: 65, shooting: 29, dribbling: 47, defense: 83, keeping: 9 } },
      { id: "esp-eric-garcia", name: "埃里克·加西亚", number: 4, position: "DF", role: "CB", marketValueM: 15, attributes: { speed: 61, passing: 56, shooting: 34, dribbling: 41, defense: 85, keeping: 4 } },
      { id: "esp-llorente", name: "马科斯·略伦特", number: 5, position: "DF", role: "CB", marketValueM: 20, attributes: { speed: 63, passing: 56, shooting: 32, dribbling: 40, defense: 83, keeping: 8 } },
      { id: "esp-merino", name: "米克尔·梅里诺", number: 6, position: "MF", role: "CM", marketValueM: 50, attributes: { speed: 75, passing: 84, shooting: 53, dribbling: 76, defense: 67, keeping: 4 } },
      { id: "esp-ferran", name: "费兰·托雷斯", number: 7, position: "FW", role: "ST", marketValueM: 28, attributes: { speed: 79, passing: 65, shooting: 88, dribbling: 73, defense: 36, keeping: 8 } },
      { id: "esp-fabian-ruiz", name: "法比安·鲁伊斯", number: 8, position: "MF", role: "CM", marketValueM: 50, attributes: { speed: 74, passing: 82, shooting: 53, dribbling: 73, defense: 71, keeping: 6 } },
      { id: "esp-gavi", name: "加维", number: 9, position: "MF", role: "CM", marketValueM: 70, attributes: { speed: 71, passing: 84, shooting: 57, dribbling: 78, defense: 65, keeping: 7 } },
      { id: "esp-olmo", name: "奥尔莫", number: 10, position: "FW", role: "ST", marketValueM: 60, attributes: { speed: 85, passing: 59, shooting: 90, dribbling: 82, defense: 37, keeping: 4 } },
      { id: "esp-yeremy-pino", name: "耶雷米·皮诺", number: 11, position: "FW", role: "ST", marketValueM: 25, attributes: { speed: 75, passing: 65, shooting: 91, dribbling: 74, defense: 37, keeping: 6 } },
      { id: "esp-porro", name: "佩德罗·波罗", number: 12, position: "DF", role: "CB", marketValueM: 45, attributes: { speed: 61, passing: 65, shooting: 28, dribbling: 41, defense: 86, keeping: 8 } },
      { id: "esp-joan-garcia", name: "琼·加西亚", number: 13, position: "GK", role: "GK", marketValueM: 25, attributes: { speed: 50, passing: 58, shooting: 14, dribbling: 36, defense: 54, keeping: 84 } },
      { id: "esp-laporte", name: "拉波尔特", number: 14, position: "DF", role: "CB", marketValueM: 18, attributes: { speed: 65, passing: 62, shooting: 29, dribbling: 44, defense: 79, keeping: 6 } },
      { id: "esp-baena", name: "阿莱士·巴埃纳", number: 15, position: "MF", role: "CM", marketValueM: 40, attributes: { speed: 69, passing: 86, shooting: 57, dribbling: 77, defense: 68, keeping: 4 } },
      { id: "esp-rodri", name: "罗德里", number: 16, position: "MF", role: "CM", marketValueM: 110, attributes: { speed: 76, passing: 90, shooting: 60, dribbling: 78, defense: 73, keeping: 4 } },
      { id: "esp-nico", name: "尼科·威廉斯", number: 17, position: "FW", role: "ST", marketValueM: 70, attributes: { speed: 79, passing: 64, shooting: 92, dribbling: 77, defense: 38, keeping: 7 } },
      { id: "esp-zubimendi", name: "苏比门迪", number: 18, position: "MF", role: "CM", marketValueM: 60, attributes: { speed: 71, passing: 86, shooting: 57, dribbling: 78, defense: 65, keeping: 8 } },
      { id: "esp-yamal", name: "亚马尔", number: 19, position: "FW", role: "ST", marketValueM: 200, attributes: { speed: 86, passing: 62, shooting: 93, dribbling: 82, defense: 37, keeping: 6 } },
      { id: "esp-pedri", name: "佩德里", number: 20, position: "MF", role: "CM", marketValueM: 140, attributes: { speed: 70, passing: 88, shooting: 56, dribbling: 79, defense: 66, keeping: 6 } },
      { id: "esp-oyarzabal", name: "奥亚萨瓦尔", number: 21, position: "FW", role: "ST", marketValueM: 30, attributes: { speed: 82, passing: 63, shooting: 85, dribbling: 77, defense: 31, keeping: 9 } },
      { id: "esp-cubarsi", name: "库巴西", number: 22, position: "DF", role: "CB", marketValueM: 70, attributes: { speed: 67, passing: 58, shooting: 35, dribbling: 48, defense: 83, keeping: 8 } },
      { id: "esp-simon", name: "乌奈·西蒙", number: 23, position: "GK", role: "GK", marketValueM: 30, attributes: { speed: 48, passing: 55, shooting: 15, dribbling: 35, defense: 57, keeping: 83 } },
      { id: "esp-cucurella", name: "库库雷利亚", number: 24, position: "DF", role: "CB", marketValueM: 40, attributes: { speed: 61, passing: 65, shooting: 29, dribbling: 49, defense: 82, keeping: 6 } },
      { id: "esp-victor-munoz", name: "维克托·穆尼奥斯", number: 25, position: "FW", role: "ST", marketValueM: 2, attributes: { speed: 69, passing: 55, shooting: 80, dribbling: 75, defense: 37, keeping: 10 } },
      { id: "esp-borja-iglesias", name: "博尔哈·伊格莱西亚斯", number: 26, position: "FW", role: "ST", marketValueM: 3, attributes: { speed: 76, passing: 56, shooting: 76, dribbling: 75, defense: 38, keeping: 9 } },
    ],
  },
  {
    ...countryProfile("KSA", "沙特阿拉伯", "Saudi Arabia", "#0b8f4d", "#f4fff8", "4-4-2", "沙特"),
    starterIds: [
      "ksa-alowais",
      "ksa-abdulhamid",
      "ksa-tambakti",
      "ksa-albulaihi",
      "ksa-alshahrani",
      "ksa-ghareeb",
      "ksa-kanno",
      "ksa-almalki",
      "ksa-aldawsari",
      "ksa-alburaikan",
      "ksa-alshehri",
    ],
    squad: [
      { id: "ksa-alowais", name: "Mohammed Al-Owais", number: 21, position: "GK", role: "GK", marketValueM: 0.7 },
      { id: "ksa-abdulhamid", name: "Saud Abdulhamid", number: 12, position: "RB", role: "FB", marketValueM: 4 },
      { id: "ksa-tambakti", name: "Hassan Tambakti", number: 17, position: "RCB", role: "CB", marketValueM: 5 },
      { id: "ksa-albulaihi", name: "Ali Al-Bulaihi", number: 5, position: "LCB", role: "CB", marketValueM: 0.8 },
      { id: "ksa-alshahrani", name: "Yasser Al-Shahrani", number: 13, position: "LB", role: "FB", marketValueM: 0.9 },
      { id: "ksa-ghareeb", name: "Abdulrahman Ghareeb", number: 18, position: "RM", role: "W", marketValueM: 3 },
      { id: "ksa-kanno", name: "Mohamed Kanno", number: 23, position: "RCM", role: "DM", marketValueM: 1.5 },
      { id: "ksa-almalki", name: "Abdulelah Al-Malki", number: 8, position: "LCM", role: "CM", marketValueM: 0.6 },
      { id: "ksa-aldawsari", name: "Salem Al-Dawsari", number: 10, position: "LM", role: "W", marketValueM: 2 },
      { id: "ksa-alburaikan", name: "Feras Al-Buraikan", number: 9, position: "RS", role: "ST", marketValueM: 6 },
      { id: "ksa-alshehri", name: "Saleh Al-Shehri", number: 11, position: "LS", role: "ST", marketValueM: 0.7 },
      { id: "ksa-alaqidi", name: "Nawaf Al-Aqidi", number: 22, position: "GK", role: "GK", marketValueM: 1.8 },
      { id: "ksa-alkhaibari", name: "Abdullah Al-Khaibari", number: 15, position: "DM", role: "DM", marketValueM: 2 },
      { id: "ksa-radif", name: "Abdullah Radif", number: 20, position: "ST", role: "ST", marketValueM: 1.8 },
    ],
  },
];

export const COUNTRY_DATABASE = Object.fromEntries(WORLD_CUP_COUNTRY_PROFILES.map((country) => [country.code, country]));

export const WORLD_CUP_48_SLOTS = WORLD_CUP_COUNTRY_PROFILES.map((country, index) => ({
  slot: index + 1,
  countryCode: country.code,
  status: country.squad?.length ? "seeded-with-squad" : "profile-only",
}));

export const COUNTRY_OPTIONS = WORLD_CUP_COUNTRY_PROFILES.map((country) => ({
  code: country.code,
  name: country.name,
  englishName: country.englishName,
  crestText: country.crestText,
}));

let sessionPlaceholderNameMap = null;

export function buildTeams(matchTeamCodes = MATCH_TEAM_CODES, matchConfig = {}) {
  sessionPlaceholderNameMap ??= {};
  return matchTeamCodes.map((countryCode, teamIndex) => {
    const country = COUNTRY_DATABASE[countryCode] ?? createPlaceholderCountry(countryCode, teamIndex);
    const direction = teamIndex === 0 ? 1 : -1;
    const sideId = teamIndex === 0 ? "home" : "away";
    const sideConfig = matchConfig[sideId] ?? {};
    const formation = FORMATIONS[sideConfig.formation] ? sideConfig.formation : FORMATIONS[country.formation] ? country.formation : "4-3-3";
    const slots = FORMATIONS[formation] ?? FORMATIONS["4-3-3"];
    const tactic = resolveTactic(sideConfig.tactic, country.tacticPool);
    const starters = resolveStarterPlayers(country, slots, sideConfig.lineupIds);
    const starterIds = new Set(starters.map((player) => player?.id).filter(Boolean));
    const team = {
      id: sideId,
      countryCode: country.code,
      name: country.name,
      shortName: country.shortName,
      englishName: country.englishName,
      crestText: country.crestText,
      primary: country.primary,
      secondary: country.secondary,
      kit: country.kit,
      direction,
      formation,
      tacticPool: country.tacticPool,
      tactic,
      score: 0,
      yellowCards: 0,
      redCards: 0,
      substitutionsUsed: 0,
      substitutions: [],
    };

    return {
      ...team,
      players: slots.map((slot, index) => createActivePlayer(country, sideId, direction, slot, index, starters[index])),
      bench: resolveBenchPlayers(country, starterIds).map((sourcePlayer, index) => createBenchPlayer(country, sideId, sourcePlayer, index)),
    };
  });
}

function createActivePlayer(country, sideId, direction, slot, index, sourcePlayer = null) {
  const player = sourcePlayer ?? createPlaceholderPlayer(country, slot, index);
  const anchor = mirrorAnchor(slot.anchor, direction);
  const role = slot.role;
  return {
    id: `${sideId}-${player.id ?? slot.number}`,
    teamId: sideId,
    countryCode: country.code,
    teamName: country.name,
    color: country.primary,
    trim: country.secondary,
    number: player.number ?? slot.number,
    name: player.name,
    position: slot.position,
    role,
    nativePosition: player.position ?? slot.position,
    nativeRole: player.role ?? slot.role,
    marketValueM: player.marketValueM ?? 0,
    databaseId: player.id ?? null,
    anchor,
    attributes: buildPlayerAttributes(role, player.marketValueM, player.attributes),
    x: anchor.x,
    y: anchor.y,
    vx: 0,
    vy: 0,
    targetX: anchor.x,
    targetY: anchor.y,
    decisionTimer: 0,
    tackleTimer: 0,
    staminaNoise: Math.random() * 0.12 + 0.94,
    order: index,
  };
}

function createBenchPlayer(country, sideId, sourcePlayer, index) {
  const role = sourcePlayer.role ?? "CM";
  return {
    id: `${sideId}-bench-${sourcePlayer.id ?? sourcePlayer.number ?? index}`,
    teamId: sideId,
    countryCode: country.code,
    teamName: country.name,
    color: country.primary,
    trim: country.secondary,
    number: sourcePlayer.number ?? index + 12,
    name: sourcePlayer.name,
    position: sourcePlayer.position ?? role,
    role,
    nativePosition: sourcePlayer.position ?? role,
    nativeRole: role,
    marketValueM: sourcePlayer.marketValueM ?? 0,
    databaseId: sourcePlayer.id ?? null,
    attributes: buildPlayerAttributes(role, sourcePlayer.marketValueM, sourcePlayer.attributes),
    isBench: true,
    order: 100 + index,
  };
}

function mirrorAnchor(anchor, direction) {
  if (direction === 1) return { ...anchor };
  return {
    x: FIELD.width - anchor.x,
    y: FIELD.height - anchor.y,
  };
}

function resolveStarterPlayers(country, slots, lineupIds = []) {
  const squadById = new Map((country.squad ?? []).map((player) => [player.id, player]));
  const configuredStarters = [];
  const usedIds = new Set();
  for (const id of lineupIds ?? []) {
    const player = squadById.get(id);
    if (!player || usedIds.has(id)) continue;
    configuredStarters.push(player);
    usedIds.add(id);
  }
  const starters = [
    ...configuredStarters,
    ...(country.starterIds ?? []).map((id) => squadById.get(id)).filter((player) => player && !usedIds.has(player.id)),
  ];
  if (starters.length >= slots.length) return starters.slice(0, slots.length);

  const starterIds = new Set(starters.map((player) => player.id));
  const remaining = (country.squad ?? []).filter((player) => !starterIds.has(player.id));
  return [...starters, ...remaining].slice(0, slots.length);
}

function resolveBenchPlayers(country, starterIds) {
  return (country.squad ?? []).filter((player) => !starterIds.has(player.id));
}

function buildPlayerAttributes(role, marketValueM = 0, overrides = {}) {
  const template = POSITION_ATTRIBUTE_TEMPLATES[role] ?? DEFAULT_ATTRIBUTES;
  const weights = ATTRIBUTE_VALUE_WEIGHTS[role] ?? {};
  const boost = marketValueBoost(marketValueM);
  const attributes = Object.keys(DEFAULT_ATTRIBUTES).reduce((result, key) => {
    const base = template[key] ?? DEFAULT_ATTRIBUTES[key];
    const weightedBoost = boost * (weights[key] ?? 0.35);
    result[key] = clampAttribute(base + weightedBoost);
    return result;
  }, {});
  return Object.keys({ ...attributes, ...overrides }).reduce((result, key) => {
    result[key] = clampAttribute(overrides[key] ?? attributes[key] ?? DEFAULT_ATTRIBUTES[key]);
    return result;
  }, {});
}

function marketValueBoost(marketValueM) {
  const value = Math.max(0.05, Number(marketValueM) || 0.05);
  return clampNumber(Math.log10(value + 1) * 9, 0, 18);
}

function createPlaceholderCountry(countryCode, teamIndex) {
  const code = countryCode || `TBD-${teamIndex + 1}`;
  return {
    code,
    fifaCode: code,
    name: `待定国家 ${teamIndex + 1}`,
    shortName: `待定${teamIndex + 1}`,
    englishName: `TBD ${teamIndex + 1}`,
    crestText: "TBD",
    primary: teamIndex === 0 ? "#e84b4b" : "#2d71d8",
    secondary: teamIndex === 0 ? "#fff3ec" : "#edf4ff",
    kit: {
      home: { shirt: teamIndex === 0 ? "#e84b4b" : "#2d71d8", trim: "#ffffff", shorts: "#263238" },
    },
    formation: teamIndex === 0 ? "4-3-3" : "4-4-2",
    tacticPool: ["balanced", "wingCross", "centralPenetration"],
    starterIds: [],
    squad: [],
  };
}

function createPlaceholderPlayer(country, slot, index) {
  const mapKey = `${country.code}-${slot.number}-${index}`;
  sessionPlaceholderNameMap[mapKey] ??= getRandomPlaceholderName(country, slot, index);
  return {
    id: `${country.code.toLowerCase()}-${slot.number}`,
    name: sessionPlaceholderNameMap[mapKey],
    number: slot.number,
    position: slot.position,
    role: slot.role,
    marketValueM: 1,
  };
}

function getRandomPlaceholderName(country, slot, index) {
  const usedNames = new Set(Object.values(sessionPlaceholderNameMap));
  const availableNames = PLAYER_NAME_POOL.filter((name) => !usedNames.has(name));
  const name = availableNames[Math.floor(Math.random() * availableNames.length)];
  return name ?? `${country.shortName}${slot.number ?? index + 1}号`;
}

function clampAttribute(value) {
  return Math.round(clampNumber(value, 1, 99));
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function pickTactic(tacticPool = ["balanced"]) {
  const tacticId = tacticPool[Math.floor(Math.random() * tacticPool.length)] ?? "balanced";
  return TACTICS[tacticId] ?? TACTICS.balanced;
}

function resolveTactic(tacticId, tacticPool) {
  if (tacticId && TACTICS[tacticId]) return TACTICS[tacticId];
  return pickTactic(tacticPool);
}

function countryProfile(code, name, englishName, primary, secondary, formation, shortName = name) {
  return {
    code,
    fifaCode: code,
    name,
    shortName,
    englishName,
    crestText: code,
    primary,
    secondary,
    kit: {
      home: { shirt: primary, trim: secondary, shorts: primary },
      away: { shirt: secondary, trim: primary, shorts: secondary },
    },
    formation,
    tacticPool: DEFAULT_TACTIC_POOL,
    starterIds: [],
    squad: [],
  };
}
