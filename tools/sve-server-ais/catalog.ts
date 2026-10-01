/**
 * sve-server's CardAbilityCatalog (what their AIs know about cards), imitated. Theirs reads each skill's configuration (its
 * type: 造成伤害, 破坏, 抽取卡片 …, numbers, targets, buffs); our cards are scripts, so the same vectors are parsed from the
 * official English text, segment by segment ({[fanfare]}, {[act]}, On Evolve - …), each recognized effect also kept as a
 * "skill" of their type for GoodAI's per-skill values. Their keyword checks on the Chinese description (疾驰, 守护,
 * 必杀 + 主战者 …) are kept as they are, on our Chinese text (the same translation as theirs: 《入场曲》, 《吃饭》 …).
 */
import type { AbilityDef, CardDefinition, Engine } from "../../packages/core/src";

export type DamageFormula = "fixed" | "handCount" | "boardCount" | "sourceAttack" | "unknown";

export interface DamageAbility {
  base: number;
  formula: DamageFormula;
  canHitEnemyPlayer: boolean;
  canHitEnemyBoard: boolean;
  conditional: boolean;
}

/** One of their skills, for GoodAI's EstimateSkillValue: its type, SkillNumData1[0] and its target teams (0 own, 1 enemy, 2 any). */
export interface SkillItem {
  type: string;
  num: number;
  teams: number[];
}

/** Their OptionalAbilityBranch: an optional "[cost]: [effect]" inside an automatic ability. */
export interface OptionalBranch {
  cost: Resource;
  benefit: Ability;
}

/** Their ResourceRequirement: what an ability costs. */
export class Resource {
  pp = 0;
  hp = 0;
  tap = 0;
  handCards = 0;
  boardCards = 0;
  sacrificesSource = false;

  merge(o: Resource | undefined, scale = 1): void {
    if (!o) return;
    this.pp += o.pp * scale;
    this.hp += o.hp * scale;
    this.tap += o.tap * scale;
    this.handCards += o.handCards * scale;
    this.boardCards += o.boardCards * scale;
    this.sacrificesSource ||= o.sacrificesSource;
  }

  clone(): Resource {
    const r = new Resource();
    r.merge(this);
    return r;
  }
}

/** Their AbilityVector. */
export class Ability {
  damages: DamageAbility[] = [];
  removal = 0;
  draw = 0;
  generate = 0;
  summon = 0;
  heal = 0;
  recoverPP = 0;
  recoverEP = 0;
  attackBuff = 0;
  defense = 0;
  disruption = 0;
  uncertainty = 0;
  grantsStorm = false;
  grantsRush = false;
  grantsGuard = false;
  grantsPlayerKiller = false;
  cost = new Resource();
  /** The skills behind the numbers (GoodAI values them one by one). */
  skills: SkillItem[] = [];
  /** Optional "[cost]: [effect]" branches, not in the numbers above (their WithoutOptionalBranches). */
  optional: OptionalBranch[] = [];

  get hasMaterialBenefit(): boolean {
    return (
      this.damages.length > 0 ||
      this.removal > 0 ||
      this.draw > 0 ||
      this.generate > 0 ||
      this.summon > 0 ||
      this.heal > 0 ||
      this.recoverPP > 0 ||
      this.recoverEP > 0 ||
      this.attackBuff > 0 ||
      this.defense > 0 ||
      this.disruption > 0 ||
      this.grantsStorm ||
      this.grantsRush ||
      this.grantsGuard ||
      this.grantsPlayerKiller
    );
  }

  merge(o: Ability | undefined, scale = 1): void {
    if (!o) return;
    this.damages.push(...o.damages.map((d) => ({ ...d, base: Math.floor(d.base * scale) })));
    this.removal += o.removal * scale;
    this.draw += o.draw * scale;
    this.generate += o.generate * scale;
    this.summon += o.summon * scale;
    this.heal += o.heal * scale;
    this.recoverPP += o.recoverPP * scale;
    this.recoverEP += o.recoverEP * scale;
    this.attackBuff += o.attackBuff * scale;
    this.defense += o.defense * scale;
    this.disruption += o.disruption * scale;
    this.uncertainty += o.uncertainty * scale;
    this.grantsStorm ||= o.grantsStorm;
    this.grantsRush ||= o.grantsRush;
    this.grantsGuard ||= o.grantsGuard;
    this.grantsPlayerKiller ||= o.grantsPlayerKiller;
    this.cost.merge(o.cost, scale);
    this.skills.push(...o.skills.map((s) => ({ ...s, teams: [...s.teams] })));
    this.optional.push(...o.optional);
  }

  clone(): Ability {
    const a = new Ability();
    a.merge(this);
    return a;
  }
}

/** Their CardAbilityProfile, plus the parts their AIs read from the card's skill lists. */
export interface CardProfile {
  /** Their UseAbility: the card's keyword buffs, its immediate-use skills, and their Chinese leader-damage fallback. */
  use: Ability;
  /** The immediate-use skills alone (Fanfare, a spell's text): PlannerAI's BuildRuntimeUseAbility when the card has some. */
  fanfare: Ability;
  hasImmediateUse: boolean;
  /** The activated abilities' vectors (their StartupSkills and EatSkills), in the order of the card's activated abilities. */
  startup: Ability[];
  /** On Evolve and On Super Evolve of this definition (an evolved card's). */
  evolve: Ability;
  superEvolve: Ability;
  lastWords: Ability;
  /** Each Strike ability (their skills triggered by 攻击 / 攻击后). */
  strike: Ability[];
  /** Other triggered text (their other skills). */
  other: Ability;
  hasStorm: boolean;
  hasRush: boolean;
  hasGuard: boolean;
  hasPlayerKiller: boolean;
}

type SegmentKind = "use" | "act" | "evolve" | "superEvolve" | "lastwords" | "strike" | "other";

/** The text cut at its trigger markers ("On Evolve -", "On Evolve:", "Strike -" … both forms occur in the data). */
export function segments(text: string, spell: boolean): { kind: SegmentKind; text: string }[] {
  const marker =
    /\{\[fanfare\]\}|\{\[lastwords\]\}|\{\[act\]\}|\{\[feed\]\}|\{\[ub\]\}|On Super Evolve\s*(?::|[-–—]|,)|On Evolve\s*(?::|[-–—]|,)|\bStrike\s*(?::|[-–—])|\bActivate\b(?! only)|\{\[evolve\]\}[^.]*?Evolve this follower\.|-{5,}|―{3,}/g;
  const out: { kind: SegmentKind; text: string }[] = [];
  let kind: SegmentKind = spell ? "use" : "other";
  let last = 0;
  for (const m of text.matchAll(marker)) {
    if (m.index! > last) out.push({ kind, text: text.slice(last, m.index) });
    const tag = m[0];
    kind = tag.includes("fanfare")
      ? "use"
      : tag.includes("lastwords")
        ? "lastwords"
        : tag.startsWith("On Super")
          ? "superEvolve"
          : tag.startsWith("On Evolve")
            ? "evolve"
            : tag.startsWith("Strike")
              ? "strike"
              : tag.includes("Evolve this follower") || /^[-―]/.test(tag)
                ? "other"
                : "act";
    last = m.index! + tag.length;
  }
  if (last < text.length) out.push({ kind, text: text.slice(last) });
  return out.filter((s) => s.text.trim() !== "");
}

/** The text of the n-th activated ability ({[act]}, Activate, {[feed]}, {[ub]}) of a card text. */
export function actSegment(text: string, nth: number, spell = false): string {
  return segments(text, spell).filter((s) => s.kind === "act")[nth]?.text ?? "";
}

const NUMBER: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5 };
const num = (s: string | undefined, fallback = 1) => (s === undefined ? fallback : /^\d+$/.test(s) ? Number(s) : (NUMBER[s.toLowerCase()] ?? fallback));

/** Whose cards a "Select …" sentence picks (their TargetSelectTeam): 1 enemy, 0 own, 2 any; none without a selection. */
function selectionTeams(s: string): number[] {
  const select = /\bselect\b([^.]*)/i.exec(s);
  if (!select) return [];
  const what = select[1]!;
  if (/\benemy\b|opponent/i.test(what)) return [1];
  if (/\byour\b|\bthis (follower|card)\b|\banother\b/i.test(what)) return [0];
  return [2];
}

/**
 * The effects of one piece of text: their AnalyzeType / AnalyzeBuffIds (one entry per skill type: 造成伤害, 破坏, 消灭, 变形,
 * 回手, 抽取卡片, 占卜, 检索, 加入手牌, 创造卡牌, 召唤随从, 治疗, 回复费用, 回复EP, 减费打出, 费用上限变化, 进化, 横置, 获取指示物,
 * 抉择 …, with their weights), by the words of the official English text.
 */
function analyze(text: string): Ability {
  const a = new Ability();
  let known = false;
  const skill = (type: string, n: number, s: string) => a.skills.push({ type, num: n, teams: selectionTeams(s) });
  // A look at the top of the deck that ends with a card in the hand is their 检索 (search); otherwise 占卜 (scry).
  const toHand = /\b(into|to) your hand\b/i.test(text);
  for (const sentence of text.split(/(?<=\.)\s+/)) {
    const s = sentence;
    const conditional = /\bif\b/i.test(s);
    // 造成伤害: "deal 1 damage to each enemy follower", "deal it 2 damage", "deal the enemy leader X damage".
    const damages = [...s.matchAll(/\bdeal\s+(?:[\w'’-]+\s+){0,5}?(\d+|X) damage/gi)].map((m) => m[1]!);
    if (damages.length === 0 && /\bdeal\s+(?:[\w'’-]+\s+){0,4}?damage equal to/i.test(s)) damages.push("X");
    for (const value of damages) {
      known = true;
      const leader = /\b(enemy leader|opponent's leader|its leader|their leader|each leader|both leaders)\b/i.test(s) || (/\bleader\b/i.test(s) && !/your leader/i.test(s));
      const follower = /follower/i.test(s);
      // Their DamageBase: what X is, often said in the next sentence ("X equals …").
      let formula: DamageFormula = value === "X" ? "unknown" : "fixed";
      if (value === "X" && /number of cards in your hand/i.test(text)) formula = "handCount";
      else if (value === "X" && /number of followers on your field/i.test(text)) formula = "boardCount";
      else if (value === "X" && /this (follower|card)'s attack/i.test(text)) formula = "sourceAttack";
      a.damages.push({ base: value === "X" ? 0 : Number(value), formula, canHitEnemyPlayer: leader, canHitEnemyBoard: follower || !leader, conditional: conditional || formula === "unknown" });
      skill("造成伤害", value === "X" ? 0 : Number(value), s);
    }
    // 破坏, 消灭, 变形, 回手 / 回牌组底, 横置: theirs count these skills whatever they target, and so does this.
    const many = /\b(each|all|any number of)\b/i.test(s) ? 2 : num(/up to (\d+|two|three)/i.exec(s)?.[1], 1);
    if (/\bdestroy\b/i.test(s)) (known = true), (a.removal += many), skill("破坏", 1, s);
    if (/\bbanish\b/i.test(s)) (known = true), (a.removal += many * 1.2), skill("消灭", 1, s);
    if (/\btransform\b/i.test(s)) (known = true), (a.removal += many * 0.85), skill("变形", 1, s);
    if (/\breturn\b.*\bhand\b/i.test(s)) (known = true), (a.removal += many * 0.72), skill("回手", 1, s);
    else if (/on the bottom of .{0,20}deck/i.test(s)) (known = true), (a.removal += many * 0.72), skill("回牌组底", 1, s);
    if (/\bengage (it|them|an enemy|each enemy|all enemy)/i.test(s)) (known = true), (a.disruption += Math.max(1, many)), skill("横置", 1, s);
    for (const m of s.matchAll(/\bdraws? (a|an|one|two|three|\d+|X) cards?/gi)) (known = true), (a.draw += num(m[1])), skill("抽取卡片", num(m[1]), s);
    if (/search your deck/i.test(s)) (known = true), (a.draw += 1), skill("检索", 1, s);
    const look = /look at the top (?:(\d+|two|three|four|five) )?cards? of (?:your|the) deck/i.exec(s);
    if (look) {
      known = true;
      if (toHand) (a.draw += 1), skill("检索", 1, s);
      else (a.generate += Math.max(1, num(look[1], 1)) * 0.45), (a.uncertainty += 0.15), skill("占卜", num(look[1], 1), s);
    }
    // 加入手牌 / 创造卡牌: cards (tokens) put into the hand or the EX area, not the card a search or a look finds.
    const put = /\b(?:put|add)s? (a|an|one|two|three|\d+|X|the top card|it|them|that card)\b.{0,60}\b(?:into|to) your (?:hand|EX area)/i.exec(s);
    if (put && !/search your deck|from among them|look at the top/i.test(s)) {
      known = true;
      a.generate += Math.max(1, num(put[1], 1));
      skill(/\btokens?\b/i.test(s) ? "创造卡牌" : "加入手牌", num(put[1], 1), s);
    }
    for (const m of s.matchAll(/\bsummon (a|an|one|two|three|\d+|X)\b/gi)) (known = true), (a.summon += num(m[1])), skill("召唤随从", num(m[1]), s);
    // 召唤已有随从: a card put onto the field from elsewhere (tokens are summoned).
    if (/\bput .{0,80}\bonto (?:your|its owner's|the) field/i.test(s) && !/\bsummon\b/i.test(s)) (known = true), (a.summon += 1), skill("召唤已有随从", 1, s);
    const heal = /give your leader \{\[defense\]\}\+(\d+|X)/i.exec(s);
    if (heal) (known = true), (a.heal += num(heal[1], 1)), skill("治疗", num(heal[1], 1), s);
    const pp = /recover (\d+|X|a|an|one) play points?/i.exec(s);
    if (pp) (known = true), (a.recoverPP += num(pp[1], 1)), skill("回复费用", num(pp[1], 1), s);
    // 费用上限变化 (0.6 per point) and 减费打出 (a play point and half a card).
    const max = /increase your max play points by (\d+|X)/i.exec(s);
    if (max) (known = true), (a.recoverPP += Math.max(1, num(max[1], 1)) * 0.6), skill("费用上限变化", num(max[1], 1), s);
    if (/\bplay (?:it|that card|them|that spell|that follower)\b.{0,40}\b(?:for 0|without paying)/i.test(s)) (known = true), (a.recoverPP += 1), (a.generate += 0.5), skill("减费打出", 1, s);
    const ep = /\b(?:recover|gain)s? (an|one|\d+) evolution points?/i.exec(s);
    if (ep) (known = true), (a.recoverEP += 1), skill("回复EP", num(ep[1], 1), s);
    // 获取指示物 / 积蓄增加: half a card per counter.
    const counters = /\b(?:put|add)s? (a|an|one|two|three|\d+|X) [\w ]{0,20}?counters?\b/i.exec(s);
    if (counters) (known = true), (a.generate += Math.max(1, num(counters[1], 1)) * 0.5), skill("获取指示物", num(counters[1], 1), s);
    // 抉择: no value of its own; the options are read as sentences.
    if (/\bchoose (one|up to \d+|\d+)\b/i.test(s)) (known = true), skill("抉择", 1, s);
    // Buffs (their 增益 buff: attack, defense) and keyword grants, as skills that add buffs.
    let buffs = 0;
    const buff = /\{\[attack\]\}\+(\d+|X)(?:\/\{\[defense\]\}\+(\d+|X))?/i.exec(s);
    if (buff && !/your leader/i.test(s)) {
      known = true;
      buffs++;
      a.attackBuff += Math.max(1, num(buff[1], 1));
      if (buff[2]) a.defense += num(buff[2], 1);
    } else if (/\{\[defense\]\}\+(\d+)/i.test(s) && !/your leader/i.test(s)) {
      known = true;
      buffs++;
      a.defense += num(/\{\[defense\]\}\+(\d+)/i.exec(s)![1]);
    }
    if (/\bevolve (it|them|a|an|that)\b/i.test(s)) (known = true), (a.defense += 2), (a.attackBuff += 2), skill("进化", 1, s);
    // Their buffs 疾驰, 突袭, 守护 (+1.5 defense), 虹吸 (+1 heal), 必杀 (their GrantsPlayerKiller). Keywords are capitalized.
    if (/\b[Gg]ive .{0,40}\bStorm\b/.test(s)) (known = true), buffs++, (a.grantsStorm = true);
    if (/\b[Gg]ive .{0,40}\bRush\b/.test(s)) (known = true), buffs++, (a.grantsRush = true);
    if (/\b[Gg]ive .{0,40}\bWard\b/.test(s)) (known = true), buffs++, (a.grantsGuard = true), (a.defense += 1.5);
    if (/\b[Gg]ive .{0,40}\bDrain\b/.test(s)) (known = true), buffs++, (a.heal += 1);
    if (/\b[Gg]ive .{0,40}\bBane\b/.test(s)) (known = true), buffs++, (a.grantsPlayerKiller = true);
    if (buffs > 0) skill("增益", 1, s);
  }
  if (!known && text.trim().length > 3) a.uncertainty += 0.32;
  return a;
}

/** A cost before a colon: "Discard a card:", "Return another card on your field to its owner's hand:", "Earth Rite:" … */
const COST_WORDS = /^(discard|return|banish|bury|put|destroy|remove|give your leader \{\[defense\]\}-|engage|pay|reveal|send|transform|earth rite)/i;

/** What a cost text costs (their AnalyzeCost / AnalyzeTargetCost), by its words. */
function costOf(text: string): Resource {
  const r = new Resource();
  const n = num(/\b(a|an|one|two|three|\d+)\b/i.exec(text)?.[1], 1);
  if (/\bdiscard\b/i.test(text)) r.handCards = Math.max(r.handCards, n);
  if (/(return|destroy|banish|bury|put) (?:an?other|\d+|a|an|two|three) .{0,40}(on your field|follower|card)/i.test(text) && !/cemetery|EX area|hand/i.test(text.replace(/to (its|their) owner'?s?’?s? hand/i, ""))) r.boardCards = Math.max(r.boardCards, n);
  if (/earth rite/i.test(text)) r.boardCards = Math.max(r.boardCards, 1);
  if (/(banish|put|bury) this (card|follower)/i.test(text)) r.sacrificesSource = true;
  if (/\bengage this\b/i.test(text)) r.tap += 1;
  const hp = /give your leader \{\[defense\]\}-(\d+)/i.exec(text);
  if (hp) r.hp += Number(hp[1]);
  const pp = /\bpay (\d+) play points?/i.exec(text);
  if (pp) r.pp += Number(pp[1]);
  return r;
}

/** One triggered segment: its effect, and an optional "[cost]: [effect]" kept as a branch (their IfCost skill). */
function analyzeTriggered(text: string): Ability {
  const colon = text.indexOf(":");
  const before = colon >= 0 ? text.slice(0, colon).replace(/^[\s,]+/, "") : "";
  if (colon >= 0 && !before.includes(". ") && COST_WORDS.test(before)) {
    const benefit = analyze(text.slice(colon + 1));
    const base = new Ability();
    base.uncertainty += benefit.uncertainty * 0.25;
    base.optional.push({ cost: costOf(before), benefit });
    return base;
  }
  // A condition before a colon (Combo (3):, Spellchain (10):, Necrocharge (10): …): its effect is conditional.
  if (colon >= 0 && !before.includes(". ") && /^[A-Z][\w ’'-]*(\(\d+\))?$/.test(before.trim())) {
    const a = analyze(text.slice(colon + 1));
    for (const d of a.damages) d.conditional = true;
    return a;
  }
  return analyze(text);
}

/** What an activated ability costs (their AnalyzeCost): our engine's cost, and the words of the text before its colon. */
export function activatedCost(ability: AbilityDef | undefined, text: string): Resource {
  const r = new Resource();
  if (ability && ability.kind === "activated") {
    r.pp += ability.cost.playPoints ?? 0;
    r.hp += ability.cost.leaderDefense ?? 0;
    if (ability.cost.engageSelf) r.tap += 1;
    if (ability.cost.burySelf) r.sacrificesSource = true;
  }
  const before = text.split(":")[0] ?? "";
  if (/\bdiscard\b/i.test(before)) r.handCards = Math.max(r.handCards, 1);
  if (/(return|destroy|banish|put) another .{0,40}(on your field|follower|card)/i.test(before)) r.boardCards = Math.max(r.boardCards, 1);
  if (/(banish|put) this (card|follower)/i.test(before)) r.sacrificesSource = true;
  return r;
}

/** Keyword lines of the English text ("Ward.", "Storm. Bane.") — the card's own keywords (their CardConfig.Buffs). */
function innateKeywords(en: string): Set<string> {
  const out = new Set<string>();
  for (const line of en.split("\n")) {
    const m = /^\s*((?:(?:Ward|Storm|Rush|Bane|Drain|Aura|Intimidate|Assail)\.\s*)+)/.exec(line);
    if (m) for (const k of m[1]!.matchAll(/(Ward|Storm|Rush|Bane|Drain|Aura|Intimidate|Assail)/g)) out.add(k[1]!);
  }
  return out;
}

const evolvedCache = new Map<string, string | null>();

/** The evolved card of a follower (an evolve-deck card with its name): theirs keep both forms in one card configuration. */
export function evolvedDefOf(engine: Engine, defId: string): string | null {
  if (evolvedCache.has(defId)) return evolvedCache.get(defId)!;
  const def = engine.db.has(defId) ? engine.db.get(defId) : null;
  const evolved = def && !def.evolved && def.type === "follower" ? (engine.db.named(def.name).find((d) => d.evolved && d.type === "follower")?.id ?? null) : null;
  evolvedCache.set(defId, evolved);
  return evolved;
}

const cache = new Map<string, CardProfile>();

/** A card's profile (their BuildCard), parsed once per definition. */
export function cardProfile(engine: Engine, defId: string): CardProfile {
  const hit = cache.get(defId);
  if (hit) return hit;
  const def: CardDefinition | null = engine.db.has(defId) ? engine.db.get(defId) : null;
  const en = def?.text.en ?? "";
  const evolvedId = evolvedDefOf(engine, defId);
  // Their Description + EvoDescription: the base card's and its evolved card's Chinese text.
  const cn = (def?.text.cn ?? "") + " " + (evolvedId ? (engine.db.get(evolvedId).text.cn ?? "") : "");
  const profile: CardProfile = {
    use: new Ability(),
    fanfare: new Ability(),
    hasImmediateUse: false,
    startup: [],
    evolve: new Ability(),
    superEvolve: new Ability(),
    lastWords: new Ability(),
    strike: [],
    other: new Ability(),
    hasStorm: false,
    hasRush: false,
    hasGuard: false,
    hasPlayerKiller: false,
  };
  for (const seg of segments(en, def?.type === "spell")) {
    if (seg.kind === "act") {
      // An activated ability's cost comes before its colon (activatedCost); its effect, after.
      const a = analyze(seg.text.includes(":") ? seg.text.slice(seg.text.indexOf(":") + 1) : seg.text);
      profile.startup.push(Object.assign(a, { cost: activatedCost(undefined, seg.text) }));
      continue;
    }
    const a = analyzeTriggered(seg.text);
    if (seg.kind === "use") profile.fanfare.merge(a), (profile.hasImmediateUse = true);
    else if (seg.kind === "evolve") profile.evolve.merge(a);
    else if (seg.kind === "superEvolve") profile.superEvolve.merge(a);
    else if (seg.kind === "lastwords") profile.lastWords.merge(a);
    else if (seg.kind === "strike") profile.strike.push(a);
    else profile.other.merge(a);
  }
  // Their AnalyzeBuffIds(config.Buffs, UseAbility): the card's own keywords.
  const keywords = innateKeywords(en);
  if (keywords.has("Storm")) (profile.use.grantsStorm = true), (profile.hasStorm = true);
  if (keywords.has("Rush")) (profile.use.grantsRush = true), (profile.hasRush = true);
  if (keywords.has("Ward")) (profile.use.grantsGuard = true), (profile.use.defense += 1.5), (profile.hasGuard = true);
  if (keywords.has("Bane")) (profile.use.grantsPlayerKiller = true), (profile.hasPlayerKiller = true);
  if (keywords.has("Drain")) profile.use.heal += 1;
  profile.use.merge(profile.fanfare);
  if (!def) profile.use.uncertainty = 1;
  // Their keyword checks on the Chinese description, as they are.
  if (cn.includes("疾驰")) profile.hasStorm = true;
  if (cn.includes("突进") || cn.includes("突袭")) profile.hasRush = true;
  if (cn.includes("守护")) profile.hasGuard = true;
  if (cn.includes("必杀") && cn.includes("主战者")) profile.hasPlayerKiller = true;
  if (!profile.use.damages.some((d) => d.canHitEnemyPlayer) && cn.includes("主战者") && cn.includes("伤害")) {
    const values = [...cn.matchAll(/(\d+)点伤害/g)].map((m) => Number(m[1]));
    if (values.length > 0) {
      profile.use.damages.push({ base: Math.max(...values), formula: "fixed", canHitEnemyPlayer: true, canHitEnemyBoard: false, conditional: cn.includes("如果") || cn.includes("的话") });
      profile.use.uncertainty += 0.45;
    }
  }
  profile.hasStorm ||= profile.use.grantsStorm;
  profile.hasGuard ||= profile.use.grantsGuard;
  profile.hasPlayerKiller ||= profile.use.grantsPlayerKiller;
  cache.set(defId, profile);
  return profile;
}
