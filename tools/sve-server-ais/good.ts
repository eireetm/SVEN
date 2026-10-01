/**
 * sve-server's GoodAI (聪明AI), imitated (docs/bot.md section 10). Every action is scored by hand-tuned formulas; a lethal
 * attack goes first; when the best scores are close, the best three are tried in a copy of the real game (Battle.CloneForAI:
 * their copies keep every hidden card, as here), played on until its next input, and the position is scored: 38% formula,
 * 62% copy. Their time budgets (6.5 s, 2.6 s, 0.7 s) are counts here. Differences from theirs, where our engine differs:
 * the effects come from the card text (catalog.ts) instead of skill configurations; the mulligan is all or nothing
 * (CR 6.2.1.8: redraw when theirs would change more than half the hand); choice texts are matched in English.
 */
import { defaultAnswer, legalSelection, validateAnswer, type Answer, type CardId, type Decision, type Engine, type GameSession, type MainAction, type PlayerId, type QuickAction } from "../../packages/core/src";
import { type Ability, type SkillItem, actSegment, activatedCost, cardProfile, evolvedDefOf } from "./catalog";
import { foolAnswer } from "./fool";
import { AttackerMemory, SBattle, averageCost, cardValue, clamp, endTurn, enhanceOption, mainAnswer, quickAnswer, textContains, type SCard, type SPlayer } from "./model";

type Kind = "attack" | "use" | "evolve" | "startup" | "eat" | "end";

interface Candidate {
  answer: Answer;
  kind: Kind;
  source?: SCard;
  target?: SCard;
  /** Evolve: the evolved card's definition. Startup / eat: the ability's index. */
  evolveDef?: string;
  ability?: number;
  score: number;
}

const TIE: Record<Kind, number> = { attack: 0, use: 1, evolve: 2, startup: 3, eat: 4, end: 9 };

export class SveGoodAI {
  /** Answers that failed and fell back to the default one (their CreateFallback / Fallback), and copies that failed. */
  readonly stats = { fallbacks: 0, simulationFailures: 0, lastError: null as string | null };
  private aggression = 1;
  private initialDeckSize = 40;
  private ready = false;
  private readonly attackers = new AttackerMemory();

  constructor(private readonly engine: Engine) {}

  decide(session: GameSession): Answer {
    const d = session.decision!;
    try {
      if (!this.ready) this.init(session, d.player);
      this.attackers.note(session, d);
      const answer = this.choose(session, d);
      if (validateAnswer(d, answer) !== null) throw new Error("illegal");
      return answer;
    } catch (e) {
      this.stats.fallbacks += 1;
      this.stats.lastError = e instanceof Error ? e.message : String(e);
      return defaultAnswer(d);
    }
  }

  /** Init(): how aggressive its deck is, from its average cost and size. */
  private init(session: GameSession, me: PlayerId): void {
    const { average, size } = averageCost(session, me);
    this.initialDeckSize = size;
    const sizeShift = size >= 45 ? -0.06 : size <= 35 ? 0.06 : 0;
    this.aggression = clamp(1.12 - (average - 3.2) * 0.13 + sizeShift, 0.68, 1.22);
    this.ready = true;
  }

  private battle(session: GameSession, d: Decision): SBattle {
    return new SBattle(this.engine, session, d.player, this.attackers.of(session, d.player));
  }

  private choose(session: GameSession, d: Decision): Answer {
    switch (d.type) {
      case "mainPhase":
      case "quick":
        return this.mainAction(this.battle(session, d));
      case "mulligan":
        return this.mulligan(this.battle(session, d), d);
      case "selectCards":
        return this.chooseCards(this.battle(session, d), d);
      case "choose": {
        // Card.Refresh plays at the highest enhance cost it can afford (not an AI choice in theirs).
        const enhance = d.reason === "playOption" ? enhanceOption(d) : null;
        return { type: "choose", ids: enhance ? [enhance] : bestChoices(d, this.battle(session, d)) };
      }
      case "confirm":
        return { type: "confirm", yes: d.reason === "optionalCost" || d.reason === "earthRite" ? this.payOptionalCost(this.battle(session, d), d) : true };
      case "chooseTurnOrder":
        return { type: "chooseTurnOrder", goFirst: true };
      default:
        return defaultAnswer(d);
    }
  }

  // ---- DecideMainAction ----

  private mainAction(b: SBattle): Answer {
    const list = this.generate(b);
    if (list.length === 0) return endTurn(b.decision);
    for (const c of list) c.score = this.score(c, b);
    list.sort((x, y) => y.score - x.score || TIE[x.kind] - TIE[y.kind]);
    const lethal = this.boardLethal(list, b);
    if (lethal) return lethal.answer;
    const immediate = list.find((c) => this.immediateLethal(c, b));
    if (immediate) return immediate.answer;
    let best = list[0]!;
    if (this.shouldClone(list)) best = this.confirmWithClones(list, b) ?? best;
    return best.answer;
  }

  private generate(b: SBattle): Candidate[] {
    const d = b.decision as Extract<Decision, { type: "mainPhase" | "quick" }>;
    const wrap = (a: MainAction | QuickAction): Answer => (d.type === "quick" ? quickAnswer(a as QuickAction) : mainAnswer(a as MainAction));
    const reader = b.session.reader();
    const out: Candidate[] = [];
    const evolveSeen = new Set<string>();
    const useEp = b.me.ep > 0;
    for (const a of d.actions as readonly (MainAction | QuickAction)[]) {
      if (a.type === "play") {
        const source = b.card(a.card);
        if (source) out.push({ answer: wrap(a), kind: "use", source, score: 0 });
      } else if (a.type === "attack") {
        const source = b.card(a.attacker);
        const target = b.card(a.target) ?? b.enemy.leader;
        if (source && this.meaningfulAttack(source)) out.push({ answer: wrap(a), kind: "attack", source, target, score: 0 });
      } else if (a.type === "evolve") {
        // One evolve per follower and evolved card: with an evolution point when it has one, super-evolving when it should.
        const source = b.card(a.card);
        if (!source) continue;
        const superEvolve = this.shouldUseExEvolve(source, b);
        const evolveDef = reader.card(a.evolveCard)?.def ?? "";
        const key = `${a.card}|${evolveDef}`;
        if (evolveSeen.has(key)) continue;
        const variants = (d.actions as readonly MainAction[]).filter((x): x is Extract<MainAction, { type: "evolve" }> => x.type === "evolve" && x.card === a.card && (reader.card(x.evolveCard)?.def ?? "") === evolveDef);
        const pick =
          variants.find((x) => x.useEvolutionPoint === useEp && x.superEvolve === superEvolve) ??
          variants.find((x) => x.useEvolutionPoint === useEp && !x.superEvolve) ??
          variants.find((x) => x.superEvolve === superEvolve) ??
          variants[0]!;
        evolveSeen.add(key);
        out.push({ answer: wrap(pick), kind: "evolve", source, evolveDef, score: 0 });
      } else if (a.type === "activate") {
        const source = b.card(a.card) ?? this.cardFromReader(b, a.card);
        const def = reader.info(a.card).abilities[a.ability]?.ability;
        if (def?.kind === "activated" && def.advanced) {
          // Their EatSkills ({[feed]}: an evolution point may pay for a play point, CR 12.16.3): UseEvoPoint = EP > 0.
          if (("useEvolutionPoint" in a && a.useEvolutionPoint === true) === useEp) out.push({ answer: wrap(a), kind: "eat", source, ability: a.ability, score: 0 });
        } else out.push({ answer: wrap(a), kind: "startup", source, ability: a.ability, score: 0 });
      }
    }
    out.push({ answer: endTurn(d), kind: "end", score: 0 });
    return out;
  }

  /** A card that isn't on the field, in hand or in the EX area (e.g. an ability usable in the cemetery). */
  private cardFromReader(b: SBattle, id: CardId): SCard {
    const info = b.session.reader().info(id);
    const card = defCard(this.engine, id, info.baseDef.id, b.me.id);
    return { ...card, abilityDef: info.def.id, atk: Math.max(0, info.attack ?? 0), hp: info.defense ?? 0 };
  }

  private score(c: Candidate, b: SBattle): number {
    switch (c.kind) {
      case "attack":
        return this.scoreAttack(c.source!, c.target!, b);
      case "use":
        return this.scoreUse(c.source!, b);
      case "evolve":
        return this.scoreEvolve(c.source!, c.evolveDef!, b);
      case "startup":
      case "eat":
        return this.scoreSkillAction(c.source!, c.ability ?? 0, b, c.kind === "eat");
      default:
        return this.scoreEndTurn(b);
    }
  }

  private scoreAttack(attacker: SCard, target: SCard, b: SBattle): number {
    const enemy = b.enemy;
    const a = this.aggression;
    if (!this.meaningfulAttack(attacker)) return -180;
    if (target.isLeader) {
      if (attacker.playerKiller || attacker.atk >= enemy.hp) return 100000;
      let v = attacker.atk * (14 * a) + (20 - enemy.hp) * 1.5 * a;
      v += this.attackTriggerValue(attacker, true);
      if (enemy.hp <= 8) v += 34 * a;
      if (this.dangerousEnemyBoard(enemy, b.me) && b.me.hp <= 8) v -= 22;
      return v;
    }
    const kills = attacker.killer || attacker.atk >= target.hp;
    const dies = target.killer || target.atk >= attacker.hp;
    let v = kills ? boardCardValue(target, b) + 22 : attacker.atk * 5;
    v = !dies ? v + 15 : v - boardCardValue(attacker, b) * 0.82;
    if (kills && !dies) v += 28;
    if (target.guard) v += 18;
    if (target.killer || target.atk >= 5) v += 12;
    if (b.me.hp <= 8) v += target.atk * 5;
    v += this.attackTriggerValue(attacker, false);
    return v / a;
  }

  private scoreUse(card: SCard, b: SBattle): number {
    const a = this.aggression;
    const cost = Math.max(0, card.cost);
    let v = 8;
    if (card.type !== "follower") v = card.type !== "amulet" ? v + 13 : v + (cost * 5 + 9);
    else {
      v += card.printedAtk * 5.2 + card.printedHp * 4.8 + 9;
      if (b.me.board.length >= b.me.maxBoard - 1) v -= 20;
      if (textContains(card, "疾驰")) v += card.printedAtk * 5 * a;
      if (textContains(card, "守护") && b.me.hp <= 10) v += 25;
    }
    v += this.textValue(card.textCn, card.printedAtk, b);
    v += this.skillListValue(cardSkills(this.engine, card.def), b);
    return v + (curveBonus(cost, b.me.pp) + this.resourcePlanBonus(card, b) - cost * 2.7);
  }

  private scoreEvolve(card: SCard, evolveDef: string, b: SBattle): number {
    const evolved = this.engine.db.has(evolveDef) ? this.engine.db.get(evolveDef) : null;
    const atkGain = Math.max(0, (evolved?.attack ?? card.atk) - card.atk);
    const hpGain = Math.max(0, (evolved?.defense ?? card.hp) - card.hp);
    let v = 24 + atkGain * 7 + hpGain * 6;
    // EstimateTextValue(config, evolve: true): the evolved card's text; its Storm term reads the printed attack (config.Attack).
    v += this.textValue(evolved?.text.cn ?? "", card.printedAtk, b);
    // The card's skills triggered by 进化 (the evolved card's On Evolve here).
    v += this.skillListValue(evolved ? cardProfile(this.engine, evolved.id).evolve : undefined, b);
    if (b.canAttack(card) && b.attackTargets(card).length > 0) v += 20;
    if (b.enemy.board.length > 0) v += 14 / this.aggression;
    if (b.me.ep <= 1 && b.enemy.hp > 8 && b.me.hp > 8) v -= 15;
    if (b.me.sep > 0 && this.shouldUseExEvolve(card, b)) v += 13;
    return v;
  }

  private scoreSkillAction(card: SCard, abilityIndex: number, b: SBattle, eat: boolean): number {
    const { ability, quick, cost } = this.activated(card, abilityIndex, b);
    let v = (eat ? 20 : 17) + this.skillListValue(ability, b);
    v += this.textValue(card.textCn, card.printedAtk, b) * 0.35;
    if (quick) v += 7;
    if (cost.tap > 0) v -= b.canAttack(card) ? card.atk * 5 : 5;
    // PPCost × 3; a {[feed]} ability's play points are their 吃饭Cost (× 2).
    if (cost.pp > 0) v -= cost.pp * (eat ? 2 : 3);
    if (cost.hp > 0) v -= cost.hp * (b.me.hp <= 8 ? 8 : 3);
    return v;
  }

  /** An activated ability: its vector (the n-th activated text segment of the card's current text), whether it is Quick, and its cost. */
  private activated(card: SCard, index: number, b: SBattle) {
    const refs = b.session.reader().info(card.id).abilities;
    const def = refs[index]?.ability;
    const nth = refs.slice(0, index).filter((r) => r.ability.kind === "activated" && !r.ability.evolve).length;
    const ability = cardProfile(this.engine, card.abilityDef).startup[nth];
    const text = this.engine.db.has(card.abilityDef) ? (this.engine.db.get(card.abilityDef).text.en ?? "") : card.textEn;
    return { ability, quick: def?.kind === "activated" && def.quick === true, cost: activatedCost(def, actSegment(text, nth)) };
  }

  private scoreEndTurn(b: SBattle): number {
    let v = -18 - b.me.pp * 5;
    if (!b.actions().some((a) => a.type !== "endMainPhase" && a.type !== "pass")) v += 30;
    if (b.inQuick) v += 15;
    if (b.me.hand.length >= b.me.maxHand) v -= 8;
    if (b.enemy.hp <= 5 && b.me.board.some((c) => b.canAttack(c))) v -= 50;
    return v;
  }

  /** EstimateTextValue: words of the Chinese description (theirs read CardConfig.Description / EvoDescription). */
  private textValue(text: string, attack: number, b: SBattle): number {
    const me = b.me;
    const enemy = b.enemy;
    const a = this.aggression;
    let v = 0;
    if (text.includes("抽取") || text.includes("抽1")) v += 13;
    if (text.includes("抽取2") || text.includes("抽2")) v += 13;
    if (text.includes("回复自己的主战者") || text.includes("恢复自己的主战者")) v += me.hp <= 10 ? 18 : 7;
    if (text.includes("给予敌方") && text.includes("主战者")) v += 15 * a;
    if (text.includes("破坏敌方") || text.includes("消灭敌方") || text.includes("返回手牌")) v += enemy.board.length > 0 ? 27 : 3;
    if (text.includes("全体") && (text.includes("伤害") || text.includes("破坏"))) v += Math.max(0, enemy.board.length - me.board.length) * 12;
    if (text.includes("召唤") || text.includes("登场")) v += 15;
    if (text.includes("获得+")) v += 10;
    if (text.includes("守护") && me.hp <= 10) v += 12;
    if (text.includes("疾驰")) v += attack * 4 * a;
    if (text.includes("谢幕曲")) v += 6;
    if (text.includes("墓场") || text.includes("墓地")) v += a < 0.9 ? 5 : 1;
    return v;
  }

  /** EstimateSkillListValue: each skill by EstimateSkillValue; an optional "[cost]: [effect]" counts its effect at 0.7 (its NextSkills). */
  private skillListValue(ability: Ability | undefined, b: SBattle): number {
    if (!ability) return 0;
    let v = 0;
    for (const s of ability.skills) v += this.skillValue(s, b);
    for (const o of ability.optional) v += this.skillListValue(o.benefit, b) * 0.7;
    return v;
  }

  /** EstimateSkillValue: by the words of the skill's type, its first number, and whose cards it selects. */
  private skillValue(skill: SkillItem, b: SBattle): number {
    const me = b.me;
    const enemy = b.enemy;
    const t = skill.type;
    const n = skill.num;
    let v = 0;
    if (t.includes("造成伤害")) v += n * 7;
    if (t.includes("抽卡") || t.includes("抽取")) v += Math.max(1, n) * 11;
    if (t.includes("回复") || t.includes("治疗")) v += Math.max(1, n) * (me.hp <= 10 ? 5 : 2);
    if (t.includes("破坏") || t.includes("消灭")) v += enemy.board.length > 0 ? 24 : 2;
    if (t.includes("召唤") || t.includes("创造")) v += 14;
    if (t.includes("增加") || t.includes("增益")) v += 8;
    for (const team of skill.teams) {
      if (team === 1) v += enemy.board.length > 0 ? 8 : 0;
      if (team === 0) v += me.board.length > 0 ? 4 : 0;
    }
    return v;
  }

  private meaningfulAttack(card: SCard): boolean {
    if (card.atk <= 0 && !card.killer && !card.playerKiller) return this.attackTriggerValue(card, true) > 0.1;
    return true;
  }

  /** AttackTriggerValue: its skills triggered by attacking (Strike): 7 plus the first number of each. */
  private attackTriggerValue(card: SCard, face: boolean): number {
    let v = 0;
    for (const strike of strikesOf(this.engine, card)) v += 7 + Math.max(0, strike.skills[0]?.num ?? 0);
    return face ? v * this.aggression : v;
  }

  private resourcePlanBonus(card: SCard, b: SBattle): number {
    const hand = b.me.hand.length;
    let v = 0;
    if ((this.initialDeckSize <= 0 ? 1 : b.me.deckCount / this.initialDeckSize) <= 0.2) {
      if (textContains(card, "抽")) v -= 22;
      if (card.printedAtk >= 4) v += 8;
    }
    if (hand >= b.me.maxHand - 1) v += 10;
    if (hand <= 2 && card.type === "spell" && textContains(card, "抽")) v += 18;
    if (this.aggression < 0.9 && card.cost >= b.me.pp && b.me.pp >= 7) v += 8;
    if (this.aggression > 1.05 && card.printedAtk >= 4) v += 6;
    return v;
  }

  private dangerousEnemyBoard(enemy: SPlayer, me: SPlayer): boolean {
    if (enemy.board.reduce((s, c) => s + c.atk, 0) < me.hp) return enemy.board.some((c) => c.killer || (c.guard && c.atk >= 4));
    return true;
  }

  /** ShouldUseExEvolve: super-evolve from its own turn 7 (first player) / 6, when it nearly kills, when low, or against a big follower. */
  private shouldUseExEvolve(card: SCard, b: SBattle): boolean {
    if (b.me.sep <= 0 || b.me.turn < (b.me.first ? 7 : 6)) return false;
    if (b.enemy.hp <= card.atk + 2) return true;
    if (b.me.hp <= 8 && b.enemy.board.length > 0) return true;
    return b.enemy.board.some((c) => c.atk >= 5 || c.killer);
  }

  private boardLethal(list: Candidate[], b: SBattle): Candidate | null {
    const face = new Map<CardId, Candidate>();
    for (const c of list) if (c.kind === "attack" && c.target?.isLeader && c.source && !face.has(c.source.id)) face.set(c.source.id, c);
    const attacks = [...face.values()];
    const killer = attacks.find((c) => c.source!.playerKiller);
    if (killer) return killer;
    if (attacks.reduce((s, c) => s + Math.max(0, c.source!.atk), 0) < b.enemy.hp) return null;
    return attacks.sort((x, y) => y.source!.atk + this.attackTriggerValue(y.source!, true) - (x.source!.atk + this.attackTriggerValue(x.source!, true)))[0] ?? null;
  }

  private immediateLethal(c: Candidate, b: SBattle): boolean {
    return c.kind === "attack" && c.target!.isLeader && (c.source!.playerKiller || c.source!.atk >= b.enemy.hp);
  }

  private shouldClone(list: Candidate[]): boolean {
    if (list.length < 2) return false;
    const top = list[0]!;
    return list.slice(1).some((c) => top.score - c.score <= 38) || ["use", "evolve", "startup", "eat"].includes(top.kind);
  }

  private confirmWithClones(list: Candidate[], b: SBattle): Candidate | null {
    const top = list[0]!.score;
    const tried = list.filter((c) => c.kind !== "end" && top - c.score <= 38).slice(0, 3);
    if (tried.length <= 1) return null;
    let best: Candidate | null = null;
    let bestScore = -Infinity;
    for (const c of tried) {
      const value = this.evaluateOnClone(c, b);
      if (value === null) continue;
      const combined = c.score * 0.38 + value * 0.62;
      if (combined > bestScore) {
        bestScore = combined;
        best = c;
      }
    }
    return best;
  }

  /** The candidate in a copy of the real game, played on until its next input (GoodAICloneAI; the opponent SimpleFoolAI). */
  private evaluateOnClone(c: Candidate, b: SBattle): number | null {
    try {
      const clone = b.session.clone();
      const me = b.player;
      clone.act(c.answer);
      for (let steps = 0; clone.decision && steps < 300; steps++) {
        const d = clone.decision;
        if (d.player === me && (d.type === "mainPhase" || d.type === "quick")) break;
        clone.act(d.player === me ? cloneAnswer(this.engine, clone) : foolAnswer(this.engine, clone));
      }
      const after = new SBattle(this.engine, clone, me);
      let value = this.evaluatePosition(after.me, after.enemy, after);
      if (after.enemy.hp <= 0 || clone.result?.winner === me) value += 100000;
      if (after.me.hp <= 0 || (clone.result && clone.result.winner !== me && clone.result.winner !== null)) value -= 100000;
      return value;
    } catch (e) {
      this.stats.simulationFailures += 1;
      this.stats.lastError = e instanceof Error ? e.message : String(e);
      return null;
    }
  }

  private evaluatePosition(self: SPlayer, enemy: SPlayer, b: SBattle): number {
    const mine = self.board.reduce((s, c) => s + boardCardValue(c, b), 0);
    const theirs = enemy.board.reduce((s, c) => s + boardCardValue(c, b), 0);
    const myHand = self.hand.length * 7 + self.ex.length * 5;
    const theirHand = enemy.handCount * 6 + enemy.ex.length * 4;
    const health = healthValue(self.hp) - healthValue(enemy.hp) * this.aggression;
    const points = (self.pp - enemy.pp) * 2 + (self.ep - enemy.ep) * 8;
    const decks = Math.min(8, self.deckCount) - Math.min(8, enemy.deckCount);
    return mine / this.aggression - theirs + myHand - theirHand + health + points + decks;
  }

  // ---- mulligan, choices ----

  /** DecideMulligan: keep cheap cards (and draw / search cards), two per cost at most; all or nothing here. */
  private mulligan(b: SBattle, d: Extract<Decision, { type: "mulligan" }>): Answer {
    const hand = d.hand.map((id) => b.card(id)).filter((c): c is SCard => c !== undefined);
    const keep = new Set<CardId>();
    const perCost = new Map<number, number>();
    for (const card of [...hand].sort((x, y) => x.cost - y.cost)) {
      const limit = this.aggression >= 1 ? 3 : 4;
      if (card.cost <= limit || textContains(card, "抽") || textContains(card, "检索")) {
        const key = Math.min(card.cost, 4);
        const n = perCost.get(key) ?? 0;
        if (n < 2 || card.cost < 3) {
          keep.add(card.id);
          perCost.set(key, n + 1);
        }
      }
    }
    if (hand.length > 0 && keep.size === 0) keep.add([...hand].sort((x, y) => x.cost - y.cost)[0]!.id);
    const change = hand.length - keep.size;
    return change > hand.length / 2 ? { type: "mulligan", redraw: true, bottomOrder: [...d.hand] } : { type: "mulligan", redraw: false };
  }

  /**
   * An optional "[cost]: [effect]" (ours asks first, then which cards pay): DecideChooseCard's test for a cost that may be
   * left unpaid — the skill's value (its effect at 0.7) against 0.85 × the cheapest cards that would pay, plus 6.
   */
  private payOptionalCost(b: SBattle, d: Extract<Decision, { type: "confirm" }>): boolean {
    const source = d.source ? (b.card(d.source) ?? this.cardFromReader(b, d.source)) : null;
    const branch = source ? optionalBranchOf(this.engine, source) : null;
    if (!source || !branch) return true;
    // The cost skill selects its own cards (TargetSelectTeam 0: +4 with followers on its field), then 0.7 × its effect.
    const value = this.skillListValue(branch.benefit, b) * 0.7 + (b.me.board.length > 0 ? 4 : 0);
    const score = (c: SCard) => this.choiceCardScore(c, b);
    const pay = (cards: SCard[], n: number) => cards.sort((x, y) => score(x) - score(y)).slice(0, Math.ceil(n)).reduce((s, c) => s + score(c), 0);
    let cost = 0;
    if (branch.cost.handCards > 0) cost += pay(b.me.hand.filter((c) => c.id !== source.id), branch.cost.handCards);
    if (branch.cost.boardCards > 0) cost += pay(b.me.board.filter((c) => c.id !== source.id), branch.cost.boardCards);
    if (branch.cost.handCards <= 0 && branch.cost.boardCards <= 0) return true;
    return value > cost * 0.85 + 6;
  }

  /** DecideChooseCard. */
  private chooseCards(b: SBattle, d: Extract<Decision, { type: "selectCards" }>): Answer {
    const none = { type: "selectCards" as const, cards: legalSelection(d.candidates, d.mandatory ?? [], d.min) };
    // A Ward follower put onto the field: their DoChoice ["竖直登场", "横置登场"] scores the first option best (it stays standing).
    if (d.reason === "wardEnterEngaged") return none;
    // A search is their DoChoice of card ids with "不检索" first: ScoreChoiceText finds no words in ids, so it takes "不检索".
    if (d.reason === "search") return none;
    const cards = d.candidates.map((id, i) => b.card(id) ?? defCard(this.engine, id, d.candidateDefs[i] ?? "", b.me.id));
    const count = Math.min(d.max, cards.length);
    if (count === 0) return none;
    const purpose = d.reason === "cost" ? "cost" : d.reason === "discard" || d.reason === "handLimitDiscard" ? "discard" : "normal";
    const score = (c: SCard) => this.choiceCardScore(c, b);
    if (purpose === "cost" && d.min < count) {
      const costValue = [...cards].sort((x, y) => score(x) - score(y)).slice(0, count).reduce((s, c) => s + score(c), 0);
      const source = d.source ? (b.card(d.source) ?? null) : null;
      const branch = source ? optionalBranchOf(this.engine, source) : null;
      const value = branch ? this.skillListValue(branch.benefit, b) * 0.7 : 0;
      if (value <= costValue * 0.85 + 6) return none;
    }
    const ordered = [...cards].sort((x, y) => (purpose === "normal" ? score(y) - score(x) : score(x) - score(y)));
    return { type: "selectCards", cards: legalSelection(ordered.map((c) => c.id), d.mandatory ?? [], count) };
  }

  private choiceCardScore(card: SCard, b: SBattle): number {
    let v = cardValue(card) + card.cost * 2;
    if (card.zone === "field") v += boardCardValue(card, b);
    if (card.guard) v += b.me.hp <= 10 ? 18 : 5;
    if (b.canAttack(card)) v += card.atk * 4;
    if (card.zone === "ex" && this.engine.db.has(card.def) && this.engine.db.get(card.def).token) v -= 12;
    return v;
  }
}

/** All of a card's triggered skills (their Card.Skills: Fanfare, Last Words, Strike, other triggers, and its evolved form's On Evolve). */
function cardSkills(engine: Engine, defId: string): Ability {
  const p = cardProfile(engine, defId);
  const all = p.fanfare.clone();
  all.merge(p.lastWords);
  for (const s of p.strike) all.merge(s);
  all.merge(p.other);
  const evolved = evolvedDefOf(engine, defId);
  if (evolved) all.merge(cardProfile(engine, evolved).evolve);
  return all;
}

/** Its skills triggered by attacking: Strike of the card and of its evolved form (theirs keep both in one card). */
export function strikesOf(engine: Engine, card: SCard): Ability[] {
  const own = cardProfile(engine, card.def).strike;
  const evolved = evolvedDefOf(engine, card.def);
  return evolved ? [...own, ...cardProfile(engine, evolved).strike] : own;
}

/** The optional "[cost]: [effect]" of a card's current text (the first one: our engine names the card, not the ability). */
export function optionalBranchOf(engine: Engine, card: SCard) {
  const p = cardProfile(engine, card.abilityDef);
  const base = card.abilityDef !== card.def ? cardProfile(engine, card.def) : null;
  for (const a of [p.fanfare, p.evolve, p.superEvolve, p.lastWords, ...p.strike, p.other, ...(base ? [base.fanfare, base.lastWords, base.other] : [])]) {
    if (a.optional.length > 0) return a.optional[0]!;
  }
  return null;
}

/** Their GoodAICloneAI, for its own decisions in a copy before its next input: by card value, the first option. */
export function cloneAnswer(engine: Engine, session: GameSession): Answer {
  const d = session.decision!;
  if (d.type === "selectCards") {
    if (d.reason === "wardEnterEngaged" || d.reason === "search") return { type: "selectCards", cards: legalSelection(d.candidates, d.mandatory ?? [], d.min) };
    const b = new SBattle(engine, session, d.player);
    const value = (id: CardId, i: number) => cardValue(b.card(id) ?? defCard(engine, id, d.candidateDefs[i] ?? "", d.player));
    const order = d.candidates.map((id, i) => ({ id, v: value(id, i) }));
    const low = d.reason === "cost" || d.reason === "discard" || d.reason === "handLimitDiscard";
    order.sort((x, y) => (low ? x.v - y.v : y.v - x.v));
    let count = Math.min(d.max, order.length);
    if (d.reason === "cost" && d.min < count && 8 <= order.slice(0, count).reduce((s, x) => s + x.v, 0) * 0.8 + 5) count = d.min;
    return { type: "selectCards", cards: legalSelection(order.map((x) => x.id), d.mandatory ?? [], count) };
  }
  if (d.type === "mulligan") return { type: "mulligan", redraw: false };
  if (d.type === "confirm" && (d.reason === "optionalCost" || d.reason === "earthRite") && d.source) {
    // Their cost test: the skill's worth (8 here: its first number × 7 is unknown) against 0.8 × the cheapest payers' GetValue, plus 5.
    const b = new SBattle(engine, session, d.player);
    const source = b.card(d.source);
    const branch = source ? optionalBranchOf(engine, source) : null;
    if (source && branch) {
      const values = (cards: SCard[], n: number) => cards.map(cardValue).sort((x, y) => x - y).slice(0, Math.ceil(n)).reduce((s, v) => s + v, 0);
      const cost = (branch.cost.handCards > 0 ? values(b.me.hand.filter((c) => c.id !== source.id), branch.cost.handCards) : 0) + (branch.cost.boardCards > 0 ? values(b.me.board.filter((c) => c.id !== source.id), branch.cost.boardCards) : 0);
      if (branch.cost.handCards > 0 || branch.cost.boardCards > 0) return { type: "confirm", yes: 8 > cost * 0.8 + 5 };
    }
    return { type: "confirm", yes: true };
  }
  if (d.type === "choose") {
    const enhance = d.reason === "playOption" ? enhanceOption(d) : null;
    return { type: "choose", ids: enhance ? [enhance] : d.options.slice(0, Math.max(d.min, Math.min(1, d.max))).map((o) => o.id) };
  }
  return foolAnswer(engine, session);
}

/** A card offered by a decision that the view doesn't show (searched, in the cemetery ...): its printed numbers. */
export function defCard(engine: Engine, id: CardId, defId: string, owner: PlayerId): SCard {
  const def = engine.db.has(defId) ? engine.db.get(defId) : null;
  const evolved = def ? evolvedDefOf(engine, defId) : null;
  return {
    id,
    def: defId,
    abilityDef: defId,
    owner,
    isLeader: false,
    type: def?.type ?? "spell",
    cost: Math.max(0, def?.cost ?? 0),
    atk: Math.max(0, def?.attack ?? 0),
    hp: def?.defense ?? 0,
    maxHp: def?.defense ?? 0,
    printedAtk: Math.max(0, def?.attack ?? 0),
    printedHp: Math.max(0, def?.defense ?? 0),
    killer: false,
    guard: false,
    hpSteal: false,
    selectDisable: false,
    playerKiller: false,
    engaged: false,
    zone: "hand",
    textCn: def?.text.cn ?? "",
    textCnAll: (def?.text.cn ?? "") + " " + (evolved ? (engine.db.get(evolved).text.cn ?? "") : ""),
    textEn: def?.text.en ?? "",
  };
}

/** BoardCardValue. */
export function boardCardValue(card: SCard, b: SBattle): number {
  let v = Math.max(0, card.atk) * 6 + Math.max(0, card.hp) * 5;
  if (card.guard) v += 12;
  if (card.killer) v += 14;
  if (card.hpSteal) v += 9;
  if (card.selectDisable) v += 8;
  if (b.canAttack(card)) v += Math.max(0, card.atk) * 3;
  return v;
}

export function healthValue(hp: number): number {
  if (hp <= 0) return -10000;
  if (hp <= 5) return hp * 10;
  if (hp <= 10) return 50 + (hp - 5) * 6;
  return 80 + (hp - 10) * 3;
}

export function curveBonus(cost: number, pp: number): number {
  const left = pp - cost;
  if (left === 0) return 14;
  if (left === 1) return 8;
  if (left >= 4) return -6;
  return 2;
}

/** DecideChoice: their words matched in English (our options are worded in English). */
export function bestChoices(d: Extract<Decision, { type: "choose" }>, b: SBattle): string[] {
  const scored = d.options.map((o, i) => ({ id: o.id, v: choiceTextScore(o.label, i, b) }));
  scored.sort((x, y) => y.v - x.v);
  return scored.slice(0, Math.max(d.min, Math.min(1, d.max))).map((x) => x.id);
}

function choiceTextScore(text: string, index: number, b: SBattle): number {
  let v = -index * 0.01;
  if (!text) return v;
  if (/cancel|don't|do not|\bno\b|skip/i.test(text)) v -= 10;
  if (/\byes\b|activate|\buse\b/i.test(text)) v += 7;
  if (/draw|hand/i.test(text)) v += b.me.hand.length <= 5 ? 8 : 2;
  if (/restore|recover|heal|leader \{\[defense\]\}\+/i.test(text)) v += b.me.hp <= 10 ? 10 : 2;
  if (/damage|destroy|banish/i.test(text)) v += 8;
  if (/evolve/i.test(text)) v += 6;
  return v;
}
