/**
 * sve-server's PlannerAI (创造性AI), imitated. Each action gets an ability vector from the card
 * catalog (catalog.ts), a cost and the face damage it should deal; a turn plan looks for lethal (the attacks at the leader
 * plus the damage in hand, within the play points, cards and evolution of the turn); actions are scored by formulas; a
 * rolling plan orders up to six of them by an abstract account (no simulation: beam 12, depth 6, 18 actions); the first
 * steps may be checked in a copy of the real game (as theirs) and dropped when they don't do what was expected. Differences
 * from theirs: effects parsed from the card text, no "summon an existing follower" or fusion bookkeeping, the mulligan all
 * or nothing, choice texts matched in English, time budgets as counts.
 */
import { defaultAnswer, legalSelection, validateAnswer, type Answer, type CardId, type Decision, type Engine, type GameSession, type MainAction, type QuickAction } from "../../packages/core/src";
import { Ability, Resource, actSegment, activatedCost, cardProfile, type DamageAbility, type OptionalBranch } from "./catalog";
import { defCard, strikesOf } from "./good";
import { foolAnswer } from "./fool";
import { AttackerMemory, SBattle, averageCost, clamp, endTurn, enhanceOption, mainAnswer, quickAnswer, type SCard } from "./model";

type Kind = "attack" | "use" | "evolve" | "startup" | "eat" | "end";

interface Candidate {
  answer: Answer;
  kind: Kind;
  source?: SCard;
  target?: SCard;
  ability: Ability | null;
  resource: Resource | null;
  /** The optional "[cost]: [effect]" branches it will pay (their OptionalCostSkillIds). */
  paid: OptionalBranch[];
  actionPP: number;
  face: number;
  expectedBenefit: number;
  expectedResourceCost: number;
  score: number;
  certainLethal: boolean;
  key: string;
  abilityIndex?: number;
}

interface Sequence {
  actions: string[];
  usedKeys: Set<string>;
  usedHand: Set<CardId>;
  attacked: Set<CardId>;
  consumed: Set<CardId>;
  pp: number;
  hand: number;
  board: number;
  face: number;
  score: number;
  usedEvolve: boolean;
}

interface TurnPlan {
  lethal: boolean;
  boardDamage: number;
  handDamage: number;
  boardKeys: Set<string>;
  damageKeys: Set<string>;
}

const TIE: Record<Kind, number> = { attack: 0, use: 1, evolve: 2, startup: 3, eat: 4, end: 9 };

export class SvePlannerAI {
  /** Answers that failed and fell back to the default one (their CreateFallback / Fallback), and copies that failed. */
  readonly stats = { fallbacks: 0, simulationFailures: 0, lastError: null as string | null };
  private aggression = 1;
  private ready = false;
  private plan: TurnPlan | null = null;
  private rolling: string[] = [];
  private plannedTurn = -1;
  /** The action it chose last: the selections and costs its abilities ask for next are answered for it (their SourceSkill). */
  private chosen: Candidate | null = null;
  private chosenTurn = -1;
  private readonly attackers = new AttackerMemory();

  constructor(private readonly engine: Engine) {}

  decide(session: GameSession): Answer {
    const d = session.decision!;
    try {
      if (!this.ready) {
        const { average, size } = averageCost(session, d.player);
        this.aggression = clamp(1.1 - (average - 3.2) * 0.12 + (size <= 35 ? 0.06 : 0), 0.72, 1.2);
        this.ready = true;
      }
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

  private choose(session: GameSession, d: Decision): Answer {
    const b = () => new SBattle(this.engine, session, d.player, this.attackers.of(session, d.player));
    switch (d.type) {
      case "mainPhase":
      case "quick":
        return this.mainAction(b());
      case "mulligan":
        return this.mulligan(b(), d);
      case "selectCards": {
        // activeOptionalCostSkills (always a set in theirs): the paid branches of the action it chose last.
        const battle = b();
        return chooseCards(this.engine, battle, d, this.plan?.lethal ?? false, this.chosen, battle.turn === this.chosenTurn);
      }
      case "choose": {
        // Card.Refresh plays at the highest enhance cost it can afford (not an AI choice in theirs).
        const enhance = d.reason === "playOption" ? enhanceOption(d) : null;
        return enhance ? { type: "choose", ids: [enhance] } : decideChoice(this.engine, b(), d);
      }
      case "confirm":
        return { type: "confirm", yes: d.reason === "optionalCost" || d.reason === "earthRite" ? payOptional(d, this.chosen) : true };
      case "chooseTurnOrder":
        return { type: "chooseTurnOrder", goFirst: true };
      default:
        return defaultAnswer(d);
    }
  }

  // ---- DecideMainAction ----

  private mainAction(b: SBattle): Answer {
    let list = this.generate(b);
    if (list.length === 0) return endTurn(b.decision);
    this.plan = this.turnPlan(list, b);
    for (const c of list) c.score = this.scoreAction(c, b, this.plan);
    list = list.sort((x, y) => y.score - x.score || TIE[x.kind] - TIE[y.kind]);
    const certain = list.find((c) => c.certainLethal);
    if (certain) return this.take(certain, b);
    if (this.plannedTurn !== b.turn || b.inQuick) {
      this.rolling = [];
      this.plannedTurn = b.turn;
    }
    let step = this.takeRolling(list);
    if (!step) {
      this.rolling = this.rollingPlan(list, b);
      step = this.takeRolling(list);
    }
    let best = step ?? list[0]!;
    if (this.shouldClone(best, list)) best = this.confirm(list, best, b) ?? best;
    return this.take(best, b);
  }

  private take(c: Candidate, b: SBattle): Answer {
    this.chosen = c;
    this.chosenTurn = b.turn;
    return c.answer;
  }

  /** TryTakeRollingPlanAction: the plan's next step while it is still about as good as the best action (else the plan is dropped). */
  private takeRolling(list: Candidate[]): Candidate | null {
    if (this.rolling.length === 0) return null;
    const key = this.rolling.shift()!;
    const step = list.find((c) => c.key === key && c.kind !== "end");
    const first = list.find((c) => c.kind !== "end");
    if (step && (!first || step.score + 30 >= first.score || this.plan?.lethal)) return step;
    this.rolling = [];
    return null;
  }

  private rollingPlan(candidates: Candidate[], b: SBattle): string[] {
    const list = candidates.filter((c) => c.kind !== "end").slice(0, 18);
    if (list.length === 0) return [];
    let states: Sequence[] = [emptySequence()];
    for (let depth = 0; depth < 6; depth++) {
      const next = [...states];
      for (const s of states) {
        for (const a of list) {
          if (!this.canAppend(s, a, b)) continue;
          const t = cloneSequence(s);
          this.append(t, a);
          next.push(t);
        }
      }
      const bySignature = new Map<string, Sequence>();
      for (const s of next) {
        const sig = signature(s);
        const have = bySignature.get(sig);
        if (!have || s.score > have.score) bySignature.set(sig, s);
      }
      states = [...bySignature.values()].sort((x, y) => y.score + this.completionBonus(y, b) - (x.score + this.completionBonus(x, b))).slice(0, 12);
      if (states.every((s) => s.actions.length <= depth)) break;
    }
    const best = states.filter((s) => s.actions.length > 0).sort((x, y) => y.score + this.completionBonus(y, b) - (x.score + this.completionBonus(x, b)))[0];
    return best ? [...best.actions] : [];
  }

  /** CanAppendToSequence: theirs count the EX area as hand (HandCards). */
  private canAppend(s: Sequence, a: Candidate, b: SBattle): boolean {
    if (s.usedKeys.has(a.key)) return false;
    if (a.source && (s.consumed.has(a.source.id) || s.usedHand.has(a.source.id))) return false;
    if (a.resource && a.resource.tap > 0 && a.source && s.attacked.has(a.source.id)) return false;
    if (a.kind === "attack" && s.attacked.has(a.source!.id)) return false;
    if (a.kind === "evolve" && s.usedEvolve) return false;
    const hand = (a.kind === "use" ? 1 : 0) + Math.ceil(a.resource?.handCards ?? 0);
    const board = Math.ceil(a.resource?.boardCards ?? 0);
    if (s.pp + a.actionPP > b.me.pp) return false;
    if (s.hand + hand > b.me.hand.length + b.me.ex.length) return false;
    if (s.board + board > b.me.board.length) return false;
    return true;
  }

  private append(s: Sequence, a: Candidate): void {
    s.actions.push(a.key);
    s.usedKeys.add(a.key);
    s.pp += a.actionPP;
    s.hand += (a.kind === "use" ? 1 : 0) + Math.ceil(a.resource?.handCards ?? 0);
    s.board += Math.ceil(a.resource?.boardCards ?? 0);
    s.face += a.face;
    s.score += this.marginalScore(a, s.actions.length);
    if (a.kind === "use" && a.source) s.usedHand.add(a.source.id);
    if (a.kind === "attack") s.attacked.add(a.source!.id);
    if (a.kind === "evolve") s.usedEvolve = true;
    if ((a.resource?.sacrificesSource || (a.resource?.tap ?? 0) > 0) && a.source) s.consumed.add(a.source.id);
  }

  private marginalScore(a: Candidate, order: number): number {
    let v = a.score;
    if (v > 100000) v = 500 + a.face * 40;
    v *= order === 1 ? 1 : 0.88;
    if (a.kind === "startup" || a.kind === "eat") v -= 5 * order;
    if (a.ability) {
      v += a.ability.draw * (order <= 2 ? 5 : 1);
      v += a.ability.recoverPP * (order <= 2 ? 4 : 1);
      v += a.ability.removal * (order <= 2 ? 3 : 0);
    }
    return v;
  }

  private completionBonus(s: Sequence, b: SBattle): number {
    let v = s.face >= b.enemy.hp ? 100000 : s.face * 8 * this.aggression;
    if (s.pp === b.me.pp) v += 12;
    if (s.actions.length > 1) v += Math.min(16, s.actions.length * 3);
    return v;
  }

  // ---- candidates ----

  private generate(b: SBattle): Candidate[] {
    const d = b.decision as Extract<Decision, { type: "mainPhase" | "quick" }>;
    const wrap = (a: MainAction | QuickAction): Answer => (d.type === "quick" ? quickAnswer(a as QuickAction) : mainAnswer(a as MainAction));
    const reader = b.session.reader();
    const out: Candidate[] = [];
    const evolveSeen = new Set<string>();
    const engagedGuard = b.enemy.board.some((c) => c.guard && c.engaged);
    const useEp = b.me.ep > 0;
    for (const a of d.actions as readonly (MainAction | QuickAction)[]) {
      if (a.type === "play") {
        const card = b.card(a.card);
        if (!card) continue;
        // BuildRuntimeUseAbility: its immediate-use skills, or (a card without any) the catalog's UseAbility at 0.82.
        const profile = cardProfile(this.engine, card.def);
        const raw = profile.hasImmediateUse ? profile.fanfare.clone() : scaled(profile.use, 0.82);
        const { ability, resource, paid } = this.resolveOptional(raw, card, b);
        let face = this.faceDamage(ability, card, b);
        if (!engagedGuard && profile.hasStorm && card.type === "follower") face += profile.hasPlayerKiller ? b.enemy.hp : card.printedAtk;
        out.push(candidate(wrap(a), "use", { source: card, ability, resource, paid, actionPP: Math.max(0, card.cost + Math.ceil(resource.pp)), face, certainLethal: face >= b.enemy.hp && ability.uncertainty < 0.2 }));
      } else if (a.type === "attack") {
        const card = b.card(a.attacker);
        if (!card || !this.meaningfulAttack(card, b)) continue;
        const target = b.card(a.target) ?? b.enemy.leader;
        const face = target.isLeader ? Math.max(0, card.atk) : 0;
        out.push(candidate(wrap(a), "attack", { source: card, target, face, certainLethal: target.isLeader && (card.playerKiller || face >= b.enemy.hp) }));
      } else if (a.type === "evolve") {
        const card = b.card(a.card);
        if (!card) continue;
        const exEvolve = this.shouldUseExEvolve(card, b);
        const evolveDef = reader.card(a.evolveCard)?.def ?? "";
        const seen = `${a.card}|${evolveDef}`;
        if (evolveSeen.has(seen)) continue;
        evolveSeen.add(seen);
        const variants = (d.actions as readonly MainAction[]).filter((x): x is Extract<MainAction, { type: "evolve" }> => x.type === "evolve" && x.card === a.card && (reader.card(x.evolveCard)?.def ?? "") === evolveDef);
        const pick =
          variants.find((x) => x.useEvolutionPoint === useEp && x.superEvolve === exEvolve) ??
          variants.find((x) => x.useEvolutionPoint === useEp && !x.superEvolve) ??
          variants.find((x) => x.superEvolve === exEvolve) ??
          variants[0]!;
        // BuildRuntimeEvolveAbility: the evolved card's On Evolve (and On Super Evolve when super-evolving).
        const evolvedProfile = cardProfile(this.engine, evolveDef);
        const raw = evolvedProfile.evolve.clone();
        if (pick.superEvolve) raw.merge(evolvedProfile.superEvolve);
        const { ability, resource, paid } = this.resolveOptional(raw, card, b);
        const evolveAbility = reader.info(card.id).abilities[pick.ability]?.ability;
        const ppCost = evolveAbility && evolveAbility.kind === "activated" ? (evolveAbility.cost.playPoints ?? 0) : 0;
        const evolvePP = Math.max(0, pick.useEvolutionPoint && ppCost > 0 ? ppCost - 1 : ppCost);
        out.push(candidate(wrap(pick), "evolve", { source: card, ability, resource, paid, actionPP: evolvePP + Math.ceil(resource.pp), face: this.faceDamage(ability, card, b), evolveKey: evolveDef }));
      } else if (a.type === "activate") {
        const card = b.card(a.card) ?? cardFromReader(this.engine, b, a.card);
        const refs = reader.info(a.card).abilities;
        const def = refs[a.ability]?.ability;
        const eat = def?.kind === "activated" && def.advanced === true;
        // Their EatSkills ({[feed]}): UseEvoPoint = EP > 0, and no ActionPPCost.
        if (eat && ("useEvolutionPoint" in a && a.useEvolutionPoint === true) !== useEp) continue;
        const nth = refs.slice(0, a.ability).filter((r) => r.ability.kind === "activated" && !r.ability.evolve).length;
        const raw = (cardProfile(this.engine, card.abilityDef).startup[nth] ?? Object.assign(new Ability(), { uncertainty: 1 })).clone();
        const text = this.engine.db.has(card.abilityDef) ? (this.engine.db.get(card.abilityDef).text.en ?? "") : card.textEn;
        raw.cost = activatedCost(def, actSegment(text, nth));
        const { ability, resource, paid } = this.resolveOptional(raw, card, b);
        this.sacrificeRule(resource, card);
        const c = candidate(wrap(a), eat ? "eat" : "startup", { source: card, ability, resource, paid, actionPP: eat ? 0 : Math.ceil(resource.pp), face: this.faceDamage(ability, card, b), abilityIndex: a.ability });
        if (this.worthActivated(c, b)) out.push(c);
      }
    }
    out.push(candidate(endTurn(d), "end", {}));
    return out;
  }

  /** ResolveOptionalAbilities / ResolveOptionalBranches: an optional "[cost]: [effect]" is paid when affordable and worth it. */
  private resolveOptional(raw: Ability, source: SCard, b: SBattle): { ability: Ability; resource: Resource; paid: OptionalBranch[] } {
    const ability = raw.clone();
    ability.optional = [];
    const resource = raw.cost.clone();
    const paid: OptionalBranch[] = [];
    for (const branch of raw.optional) {
      if (this.acceptBranch(branch, source, b)) {
        ability.merge(branch.benefit);
        resource.merge(branch.cost);
        paid.push(branch);
      }
    }
    ability.optional = [];
    return { ability, resource, paid };
  }

  acceptBranch(branch: OptionalBranch, source: SCard, b: SBattle): boolean {
    const utility = this.abilityUtility(branch.benefit, source, b);
    const cost = this.resourceValue(branch.cost, source, b);
    const face = this.faceDamage(branch.benefit, source, b);
    const pp = b.me.pp - (source.zone === "hand" ? Math.max(0, source.cost) : 0);
    return (
      branch.cost.pp <= pp &&
      branch.cost.hp < b.me.hp &&
      branch.cost.handCards <= b.me.hand.filter((c) => c.id !== source.id).length &&
      branch.cost.boardCards <= b.me.board.filter((c) => c.id !== source.id).length &&
      (face >= b.enemy.hp || (face > 0 && b.me.pp <= 3) || utility >= cost * 1.12 + 5)
    );
  }

  /** EstimateResourceCost: an ability that sacrifices its card costs a card of the field (or of the hand) too. */
  private sacrificeRule(r: Resource, source: SCard): void {
    if (!r.sacrificesSource) return;
    if (source.zone === "field") r.boardCards = Math.max(r.boardCards, 1);
    else if (source.zone === "hand") r.handCards = Math.max(r.handCards, 1);
  }

  private meaningfulAttack(card: SCard, b: SBattle): boolean {
    if (card.atk <= 0 && !card.killer && !card.playerKiller) return this.attackSkillValue(card, b) > 0.1;
    return true;
  }

  /** AttackSkillValue: the rough worth of its skills triggered by attacking (Strike), at 0.6. */
  private attackSkillValue(card: SCard, b: SBattle): number {
    return strikesOf(this.engine, card).reduce((s, a) => s + roughAbility(a, b) * 0.6, 0);
  }

  // ---- turn plan ----

  private turnPlan(candidates: Candidate[], b: SBattle): TurnPlan {
    const plan: TurnPlan = { lethal: false, boardDamage: 0, handDamage: 0, boardKeys: new Set(), damageKeys: new Set() };
    const faceByAttacker = new Map<CardId, Candidate>();
    for (const c of candidates) if (c.kind === "attack" && c.target?.isLeader && !faceByAttacker.has(c.source!.id)) faceByAttacker.set(c.source!.id, c);
    const attacks = [...faceByAttacker.values()];
    if (attacks.some((c) => c.source!.playerKiller)) {
      plan.lethal = true;
      plan.boardDamage = b.enemy.hp;
    } else plan.boardDamage = attacks.reduce((s, c) => s + Math.max(0, c.face), 0);
    for (const c of attacks) plan.boardKeys.add(c.key);
    const groups = new Map<string, Candidate[]>();
    for (const c of candidates) {
      if (c.face <= 0 || !["use", "evolve", "startup", "eat"].includes(c.kind) || !c.source) continue;
      groups.set(c.source.id, [...(groups.get(c.source.id) ?? []), c]);
    }
    const boardFace = new Map([...faceByAttacker].map(([id, c]) => [id, c.face]));
    type DamageState = { damage: number; pp: number; hand: number; board: number; lost: number; usedEvolve: boolean; actions: string[]; usedHand: Set<CardId> };
    let states: DamageState[] = [{ damage: 0, pp: 0, hand: 0, board: 0, lost: 0, usedEvolve: false, actions: [], usedHand: new Set() }];
    for (const group of groups.values()) {
      const next = states.map((s) => ({ ...s, actions: [...s.actions], usedHand: new Set(s.usedHand) }));
      for (const s of states) {
        for (const c of group) {
          if ((c.kind === "evolve" && s.usedEvolve) || (c.source && s.usedHand.has(c.source.id))) continue;
          const pp = Math.max(0, c.actionPP);
          const hand = (c.kind === "use" ? 1 : 0) + Math.ceil(c.resource?.handCards ?? 0);
          const board = Math.ceil(c.resource?.boardCards ?? 0);
          if (s.pp + pp > b.me.pp || s.hand + hand > b.me.hand.length || s.board + board > b.me.board.length) continue;
          const t = { ...s, actions: [...s.actions, c.key], usedHand: new Set(s.usedHand), pp: s.pp + pp, hand: s.hand + hand, board: s.board + board, damage: s.damage + c.face };
          if (((c.resource?.tap ?? 0) > 0 || c.resource?.sacrificesSource) && boardFace.has(c.source!.id)) t.lost += boardFace.get(c.source!.id)!;
          if (c.kind === "use") t.usedHand.add(c.source!.id);
          if (c.kind === "evolve") t.usedEvolve = true;
          next.push(t);
        }
      }
      const bySig = new Map<string, DamageState>();
      for (const s of next) {
        const sig = `${s.pp}:${s.hand}:${s.board}:${s.lost}:${s.usedEvolve}:${[...s.usedHand].sort().join(",")}`;
        const have = bySig.get(sig);
        if (!have || s.damage > have.damage) bySig.set(sig, s);
      }
      states = [...bySig.values()].sort((x, y) => y.damage - y.lost - (x.damage - x.lost) || x.pp + x.hand * 2 + x.board * 3 - (y.pp + y.hand * 2 + y.board * 3)).slice(0, 128);
    }
    const best = [...states].sort((x, y) => y.damage - y.lost - (x.damage - x.lost) || x.actions.length - y.actions.length)[0]!;
    plan.boardDamage = Math.max(0, plan.boardDamage - best.lost);
    plan.handDamage = best.damage;
    for (const k of best.actions) plan.damageKeys.add(k);
    plan.lethal ||= plan.boardDamage + plan.handDamage >= b.enemy.hp;
    return plan;
  }

  // ---- scores ----

  private scoreAction(c: Candidate, b: SBattle, plan: TurnPlan): number {
    if (plan.lethal) {
      if (c.kind === "attack" && c.target?.isLeader && plan.boardKeys.has(c.key)) return 120000 + c.face * 40 + (c.source!.playerKiller ? 5000 : 0);
      if (plan.damageKeys.has(c.key)) return 121000 + c.face * 42 - c.actionPP * 2;
      if (c.kind !== "end") return -2000;
    }
    switch (c.kind) {
      case "attack":
        return this.scoreAttack(c, b);
      case "use":
        return this.scoreUse(c, b);
      case "evolve":
        return this.scoreEvolve(c, b);
      case "startup":
      case "eat":
        return this.scoreActivated(c, b);
      default:
        return this.scoreEndTurn(b);
    }
  }

  private scoreAttack(c: Candidate, b: SBattle): number {
    const source = c.source!;
    const skill = this.attackSkillValue(source, b);
    if (source.atk <= 0 && !source.killer && !source.playerKiller && skill <= 0.1) return -180;
    if (c.target!.isLeader) {
      let v = source.atk * 15 * this.aggression + (20 - b.enemy.hp) * 1.5;
      if (b.enemy.hp <= 8) v += 30;
      return v + skill;
    }
    const target = c.target!;
    const kills = source.killer || source.atk >= target.hp;
    const dies = target.killer || target.atk >= source.hp;
    let v = kills ? boardValue(target, b) + 24 : source.atk * 4;
    v = !dies ? v + 15 : v - boardValue(source, b) * 0.78;
    if (kills && !dies) v += 26;
    if (target.guard || target.killer) v += 14;
    if (b.me.hp <= 8) v += target.atk * 5;
    return v / this.aggression;
  }

  private scoreUse(c: Candidate, b: SBattle): number {
    const card = c.source!;
    let v = this.abilityUtility(c.ability, card, b);
    // CardConfig.Cost: the printed cost.
    const printedCost = this.engine.db.has(card.def) ? Math.max(0, this.engine.db.get(card.def).cost ?? 0) : card.cost;
    if (card.type !== "follower") v = card.type !== "amulet" ? v + 10 : v + (12 + printedCost * 3);
    else {
      v += card.printedAtk * 5.2 + card.printedHp * 4.7 + 8;
      if (b.me.board.length >= b.me.maxBoard) v -= 36;
      const profile = cardProfile(this.engine, card.def);
      if (profile.hasGuard && b.me.hp <= 10) v += 22;
      if (profile.hasStorm) v += c.face * 7 * this.aggression;
    }
    v += c.face * 8 * this.aggression;
    v -= c.actionPP * 3;
    v -= this.resourceValue(c.resource, card, b);
    v += curveBonus(c.actionPP, b.me.pp);
    if (b.me.deckCount <= 7 && (c.ability?.draw ?? 0) > 0) v -= 18;
    return v;
  }

  private scoreEvolve(c: Candidate, b: SBattle): number {
    const card = c.source!;
    const evolveDef = c.key.split(":")[4] ?? "";
    const evolved = this.engine.db.has(evolveDef) ? this.engine.db.get(evolveDef) : null;
    const atkGain = Math.max(0, (evolved?.attack ?? card.atk) - card.atk);
    const hpGain = Math.max(0, (evolved?.defense ?? card.hp) - card.hp);
    let v = 4 + atkGain * 7 + hpGain * 6;
    v += this.abilityUtility(c.ability, card, b);
    v += c.face * 6 * this.aggression;
    v -= c.actionPP * 4.5;
    if (c.actionPP > 0) v += curveBonus(c.actionPP, b.me.pp);
    if (b.canAttack(card)) v += 12;
    else if (b.enemy.board.length > 0) v += Math.min(12, Math.max(0, card.atk + atkGain) * 2.5) / this.aggression;
    const answer = c.answer as Extract<Answer, { type: "mainPhase" }>;
    if (answer.action.type === "evolve" && answer.action.useEvolutionPoint) v -= b.me.ep <= 1 && b.me.hp > 8 && b.enemy.hp > 9 ? 14 : 5;
    return v;
  }

  private scoreActivated(c: Candidate, b: SBattle): number {
    const benefit = c.expectedBenefit > 0 ? c.expectedBenefit : this.abilityUtility(c.ability, c.source!, b);
    const cost = c.expectedResourceCost > 0 ? c.expectedResourceCost : this.resourceValue(c.resource, c.source!, b);
    let v = benefit - cost * 1.15 - (c.ability?.uncertainty ?? 0) * 12;
    if (this.negligibleCost(c, b)) v += 8;
    if (c.face > 0) v += c.face * 8 * this.aggression;
    if ((c.resource?.handCards ?? 0) > 0) v -= 6;
    if ((c.resource?.tap ?? 0) > 0 && b.canAttack(c.source!)) v -= c.source!.atk * 4;
    return v;
  }

  private scoreEndTurn(b: SBattle): number {
    let v = -12 - b.me.pp * 4;
    if (b.inQuick) v += 15;
    if (b.enemy.hp <= 6) v -= 12;
    return v;
  }

  abilityUtility(ability: Ability | null, source: SCard, b: SBattle): number {
    if (!ability) return 0;
    const face = this.faceDamage(ability, source, b);
    const board = ability.damages.filter((d) => d.canHitEnemyBoard).reduce((s, d) => s + damageOf(d, source, b), 0);
    const me = b.me;
    const enemy = b.enemy;
    const a = this.aggression;
    return (
      face * (enemy.hp <= 10 ? 12 : 8) * a +
      (Math.min(board, enemy.board.reduce((s, c) => s + Math.max(0, c.hp), 0)) * 4.5) / a +
      (ability.removal * (enemy.board.length > 0 ? 24 : 4)) / a +
      ability.draw * (me.hand.length <= 5 ? 13 : 7) +
      (ability.generate * 8 + ability.summon * (me.board.length < me.maxBoard ? 15 : 3)) +
      ability.heal * (me.hp <= 10 ? 6 : 2) +
      (ability.recoverPP * 8 + ability.recoverEP * 10) +
      ability.attackBuff * (me.board.length > 0 ? 6 : 1) +
      ability.defense * (me.hp <= 10 ? 8 : 3) +
      ability.disruption * (enemy.board.length > 0 ? 10 : 2)
    );
  }

  faceDamage(ability: Ability | null, source: SCard, b: SBattle): number {
    if (!ability) return 0;
    let sum = 0;
    for (const d of ability.damages.filter((x) => x.canHitEnemyPlayer)) {
      let n = damageOf(d, source, b);
      if (d.conditional) n = Math.floor(n * 0.8);
      sum += Math.max(0, n);
    }
    return sum;
  }

  resourceValue(r: Resource | null, source: SCard, b: SBattle): number {
    if (!r) return 0;
    let hand = b.me.hand.filter((c) => c.id !== source.id).map((c) => handValue(this.engine, c)).sort((x, y) => x - y).slice(0, Math.ceil(r.handCards)).reduce((s, v) => s + v, 0);
    if (r.handCards > 0 && hand <= 0) hand = r.handCards * 12;
    let board = b.me.board.filter((c) => c.id !== source.id).map((c) => boardValue(c, b)).sort((x, y) => x - y).slice(0, Math.ceil(r.boardCards)).reduce((s, v) => s + v, 0);
    if (r.boardCards > 0 && board <= 0) board = r.boardCards * 22;
    const hpWorth = b.me.hp <= 8 ? 8 : 3;
    let tap = 0;
    if (r.tap > 0) tap = r.tap * Math.max(1, b.canAttack(source) ? Math.max(0, source.atk) * 5 + Math.max(0, this.attackSkillValue(source, b)) * 0.5 : 0);
    return r.pp * 4 + r.hp * hpWorth + tap + hand + board;
  }

  private negligibleCost(c: Candidate, b: SBattle): boolean {
    const r = c.resource;
    if (!r) return true;
    if (r.pp > 0 || r.hp > 0 || r.handCards > 0 || r.boardCards > 0 || r.sacrificesSource) return false;
    if (r.tap <= 0) return true;
    const s = c.source;
    return s !== undefined && s.atk <= 0 && !s.killer && !s.playerKiller && this.attackSkillValue(s, b) <= 0.1;
  }

  /** WorthUsingActivatedAbility. */
  private worthActivated(c: Candidate, b: SBattle): boolean {
    const benefit = this.abilityUtility(c.ability, c.source!, b);
    const cost = this.resourceValue(c.resource, c.source!, b);
    c.expectedBenefit = benefit;
    c.expectedResourceCost = cost;
    if (c.face >= b.enemy.hp) return true;
    if (!c.ability?.hasMaterialBenefit) return false;
    if (benefit > 0 && c.ability.uncertainty <= 0.15 && this.negligibleCost(c, b)) return true;
    if (c.ability.uncertainty >= 1.15 && benefit < 34) return false;
    if ((c.resource?.handCards ?? 0) > 0 && benefit < cost * 1.25 + 8) return false;
    if ((c.resource?.boardCards ?? 0) > 0 && benefit < cost * 1.35 + 10) return false;
    return benefit >= cost * 1.08 + 3;
  }

  /** ShouldUseExEvolve, by its own turn count (Player.Turn). */
  private shouldUseExEvolve(card: SCard, b: SBattle): boolean {
    if (b.me.sep <= 0 || b.me.turn < (b.me.first ? 7 : 6)) return false;
    if (b.enemy.hp > card.atk + 2 && (b.me.hp > 8 || b.enemy.board.length <= 0)) return b.enemy.board.some((c) => c.atk >= 5 || c.killer);
    return true;
  }

  // ---- checking in a copy ----

  private shouldClone(best: Candidate, list: Candidate[]): boolean {
    if (best.kind === "end" || (best.kind === "attack" && best.target?.isLeader && best.ability === null)) return false;
    if (this.deterministicActivated(best)) return false;
    if (best.kind === "startup" || best.kind === "eat" || best.face > 0) return true;
    return list.length > 1 && best.score - list[1]!.score < 24;
  }

  /** IsDeterministicActivatedAbility: a damage skill (造成伤害) alone, no optional cost paid, fixed unconditional damage. */
  private deterministicActivated(c: Candidate): boolean {
    if (c.kind !== "startup" && c.kind !== "eat") return false;
    if (!c.ability || c.ability.uncertainty > 0.15) return false;
    if (c.paid.length > 0 || c.ability.skills.length === 0 || c.ability.skills.some((s) => s.type !== "造成伤害")) return false;
    return c.ability.damages.length > 0 && c.ability.damages.every((d) => d.formula === "fixed" && !d.conditional);
  }

  private confirm(list: Candidate[], preferred: Candidate, b: SBattle): Candidate | null {
    const tried: Candidate[] = [];
    for (const c of [preferred, ...list.filter((x) => x.kind !== "end")]) if (c.kind !== "end" && !tried.some((t) => t.key === c.key) && tried.length < 2) tried.push(c);
    const rejected = new Set<Candidate>();
    let best: Candidate | null = null;
    let bestScore = -Infinity;
    for (const c of tried) {
      const outcome = this.evaluateOnClone(c, b);
      // A copy that failed is skipped (theirs catch it); one that doesn't meet the expectation is rejected.
      if (!outcome) continue;
      if (!outcome.meets) {
        rejected.add(c);
        continue;
      }
      const v = c.score + outcome.delta * 0.55;
      if (v > bestScore) {
        bestScore = v;
        best = c;
      }
    }
    if (best) return best;
    if (rejected.size > 0) {
      const end = list.find((x) => x.kind === "end");
      const alt = list.find((x) => !rejected.has(x) && x.kind !== "startup" && x.kind !== "eat" && x.kind !== "end" && (!end || x.score > end.score));
      if (alt) return alt;
      if (rejected.has(preferred) && (preferred.kind === "startup" || preferred.kind === "eat")) return end ?? null;
    }
    return null;
  }

  /** The candidate in a copy of the real game, until its next input (PlannerCloneAI for its own choices, SimpleFoolAI for the opponent). */
  private evaluateOnClone(c: Candidate, b: SBattle): { meets: boolean; delta: number } | null {
    try {
      const me = b.player;
      const before = snapshot(b);
      const clone = b.session.clone();
      clone.act(c.answer);
      for (let steps = 0; clone.decision && steps < 300; steps++) {
        const d = clone.decision;
        if (d.player === me && (d.type === "mainPhase" || d.type === "quick")) break;
        let answer: Answer;
        if (d.player !== me) answer = foolAnswer(this.engine, clone);
        else if (d.type === "selectCards") answer = chooseCards(this.engine, new SBattle(this.engine, clone, me), d, c.face > 0, c, true);
        else if (d.type === "choose") answer = decideChoice(this.engine, new SBattle(this.engine, clone, me), d);
        else if (d.type === "confirm") answer = { type: "confirm", yes: d.reason === "optionalCost" || d.reason === "earthRite" ? payOptional(d, c) : true };
        else if (d.type === "mulligan") answer = { type: "mulligan", redraw: false };
        else answer = foolAnswer(this.engine, clone);
        clone.act(answer);
      }
      const after = snapshot(new SBattle(this.engine, clone, me));
      const destroyed = clone.result?.winner === me || after.enemyHp <= 0;
      const dealt = before.enemyHp - after.enemyHp;
      const usedHand = before.hand - after.hand;
      const delta = (before.enemyHp - after.enemyHp) * 10 + (before.enemyBoard - after.enemyBoard) + (after.myBoard - before.myBoard) + (after.hand - before.hand) * 8 + (after.myHp - before.myHp) * 3 + (after.pp - before.pp) * 2;
      let meets = true;
      if (c.face > 0 && dealt <= 0 && !destroyed) meets = false;
      if (c.face > 1 && dealt < Math.min(c.face, 2) && !destroyed) meets = false;
      if (c.kind === "startup" || c.kind === "eat") {
        const handCost = Math.ceil(c.resource?.handCards ?? 0);
        if (usedHand > handCost && delta < 25) meets = false;
        if (delta < Math.max(2, (c.expectedBenefit - c.expectedResourceCost) * 0.08)) meets = false;
      }
      return { meets, delta };
    } catch (e) {
      this.stats.simulationFailures += 1;
      this.stats.lastError = e instanceof Error ? e.message : String(e);
      return null;
    }
  }

  // ---- mulligan ----

  private mulligan(b: SBattle, d: Extract<Decision, { type: "mulligan" }>): Answer {
    const hand = d.hand.map((id) => b.card(id)).filter((c): c is SCard => c !== undefined);
    const keep = new Set<CardId>();
    const perCost = new Map<number, number>();
    for (const card of [...hand].sort((x, y) => x.cost - y.cost)) {
      const profile = cardProfile(this.engine, card.def);
      if (card.cost <= (this.aggression >= 1 ? 3 : 4) || profile.use.draw > 0 || profile.use.generate > 0) {
        const key = Math.min(4, card.cost);
        const n = perCost.get(key) ?? 0;
        if (n < 2 || card.cost < 3) {
          keep.add(card.id);
          perCost.set(key, n + 1);
        }
      }
    }
    if (hand.length > 0 && keep.size === 0) keep.add([...hand].sort((x, y) => x.cost - y.cost)[0]!.id);
    return hand.length - keep.size > hand.length / 2 ? { type: "mulligan", redraw: true, bottomOrder: [...d.hand] } : { type: "mulligan", redraw: false };
  }
}

function candidate(answer: Answer, kind: Kind, o: Partial<Candidate> & { evolveKey?: string }): Candidate {
  const c: Candidate = {
    answer,
    kind,
    source: o.source,
    target: o.target,
    ability: o.ability ?? null,
    resource: o.resource ?? null,
    paid: o.paid ?? [],
    actionPP: o.actionPP ?? 0,
    face: o.face ?? 0,
    expectedBenefit: 0,
    expectedResourceCost: 0,
    score: 0,
    certainLethal: o.certainLethal ?? false,
    key: "",
    abilityIndex: o.abilityIndex,
  };
  c.key = `${kind}:${o.source?.id ?? -1}:${o.target?.id ?? -1}:${o.abilityIndex ?? -1}:${o.evolveKey ?? ""}`;
  return c;
}

/** A vector at a scale (their Merge(v, 0.82)). */
function scaled(a: Ability, scale: number): Ability {
  const out = new Ability();
  out.merge(a, scale);
  return out;
}

/** A card the view doesn't show where its ability is used (the cemetery …): its current numbers. */
function cardFromReader(engine: Engine, b: SBattle, id: CardId): SCard {
  const info = b.session.reader().info(id);
  return { ...defCard(engine, id, info.baseDef.id, b.me.id), abilityDef: info.def.id, atk: Math.max(0, info.attack ?? 0), hp: info.defense ?? 0, zone: "hand" };
}

function emptySequence(): Sequence {
  return { actions: [], usedKeys: new Set(), usedHand: new Set(), attacked: new Set(), consumed: new Set(), pp: 0, hand: 0, board: 0, face: 0, score: 0, usedEvolve: false };
}

function cloneSequence(s: Sequence): Sequence {
  return { ...s, actions: [...s.actions], usedKeys: new Set(s.usedKeys), usedHand: new Set(s.usedHand), attacked: new Set(s.attacked), consumed: new Set(s.consumed) };
}

function signature(s: Sequence): string {
  return `${s.pp}:${s.hand}:${s.board}:${s.usedEvolve}:${[...s.usedHand].sort().join(",")}:${[...s.attacked].sort().join(",")}:${[...s.consumed].sort().join(",")}`;
}

function damageOf(d: DamageAbility, source: SCard, b: SBattle): number {
  switch (d.formula) {
    case "handCount":
      return b.me.hand.length;
    case "boardCount":
      return b.me.board.filter((c) => c.type === "follower").length * Math.max(1, d.base);
    case "sourceAttack":
      return source.atk + d.base;
    default:
      return Math.max(0, d.base);
  }
}

/** PositionSnapshot.Create: theirs count the EX area as hand (HandCards). */
function snapshot(b: SBattle) {
  return {
    myHp: b.me.hp,
    enemyHp: b.enemy.hp,
    hand: b.me.handCount + b.me.ex.length,
    pp: b.me.pp,
    myBoard: b.me.board.reduce((s, c) => s + boardValue(c, b), 0),
    enemyBoard: b.enemy.board.reduce((s, c) => s + boardValue(c, b), 0),
  };
}

function curveBonus(cost: number, pp: number): number {
  const left = pp - cost;
  if (left === 0) return 13;
  if (left === 1) return 7;
  if (left < 4) return 2;
  return -5;
}

function roughAbility(a: Ability, b: SBattle): number {
  const low = b.me.hp <= 10;
  return a.damages.reduce((s, d) => s + Math.max(0, d.base), 0) * 8 + a.removal * 20 + a.draw * 12 + a.generate * 8 + a.summon * 14 + a.heal * (low ? 5 : 2) + a.recoverPP * 7 + a.attackBuff * 5 + a.defense * 5;
}

function handValue(engine: Engine, card: SCard): number {
  const p = cardProfile(engine, card.def);
  return 7 + card.cost * 2 + p.use.draw * 5 + p.use.removal * 6 + (p.hasStorm ? card.printedAtk * 3 : 0);
}

function boardValue(card: SCard, b: SBattle): number {
  if (card.isLeader) return 0;
  let v = Math.max(0, card.atk) * 6 + Math.max(0, card.hp) * 5;
  if (card.guard) v += 12;
  if (card.killer) v += 13;
  if (card.hpSteal) v += 8;
  if (card.selectDisable) v += 7;
  if (b.canAttack(card)) v += Math.max(0, card.atk) * 2;
  return v;
}

function selectValue(engine: Engine, card: SCard, b: SBattle): number {
  if (card.isLeader) return card.owner !== b.me.id ? 20 : 10000;
  return card.zone === "field" ? boardValue(card, b) : handValue(engine, card);
}

function targetDamageScore(card: SCard, b: SBattle, damage: number, preferFace: boolean): number {
  if (card.isLeader) {
    if (card.owner !== b.me.id && preferFace) return 100000;
    return card.owner === b.me.id ? -10000 : 25;
  }
  if (card.owner === b.me.id) return -boardValue(card, b);
  let v = boardValue(card, b);
  if (damage > 0 && damage >= card.hp) v += 35;
  else if (damage > 0) v -= (card.hp - damage) * 4;
  return v;
}

/**
 * GetSkill(SourceSkill.Id): the vector of the ability asking. Ours names the card: the action it chose (its play, evolve or
 * activated ability), else the card's text (a spell being played: its own; otherwise its first ability with effects).
 */
function sourceVector(engine: Engine, b: SBattle, source: CardId | null, chosen: Candidate | null, current: boolean): Ability | null {
  if (!source) return null;
  const card = b.card(source);
  if (current && chosen && chosen.source?.id === source) {
    if (chosen.ability) return chosen.ability;
    // Its attack: the selection is its Strike's.
    if (chosen.kind === "attack" && card) {
      const strikes = new Ability();
      for (const s of strikesOf(engine, card)) strikes.merge(s);
      return strikes;
    }
  }
  if (!card) return null;
  const p = cardProfile(engine, card.abilityDef);
  if (card.zone === "resolution" || card.zone === "hand") return p.fanfare;
  for (const a of [p.fanfare, p.evolve, p.lastWords, ...p.strike, p.other, ...p.startup]) if (a.skills.length > 0 || a.damages.length > 0) return a;
  return p.fanfare;
}

/**
 * The optional "[cost]: [effect]" ours asks about before the cards that pay it. Theirs pay a cost skill only when it is among
 * the branches the chosen action resolved as worth paying (activeOptionalCostSkills / PayOptionalCosts, never null there).
 */
function payOptional(d: Extract<Decision, { type: "confirm" }>, chosen: Candidate | null): boolean {
  return d.source !== null && chosen !== null && chosen.source?.id === d.source && chosen.paid.length > 0;
}

/** SearchChoiceValue: a card to search for, by its numbers, what it does, and whether it can be played now. */
function searchValue(engine: Engine, defId: string, b: SBattle): number {
  if (!engine.db.has(defId)) return 1;
  const def = engine.db.get(defId);
  const p = cardProfile(engine, defId);
  let v = 8 + Math.max(0, def.cost ?? 0) * 1.5;
  if (def.type === "follower") v += Math.max(0, def.attack ?? 0) * 3.5 + Math.max(0, def.defense ?? 0) * 3;
  v += p.use.draw * 8 + p.use.generate * 5 + p.use.removal * 8 + p.use.summon * 7 + p.use.heal * (b.me.hp <= 10 ? 3 : 1);
  if (p.hasStorm) v += Math.max(0, def.attack ?? 0) * 4;
  if (p.hasGuard && b.me.hp <= 10) v += 9;
  if ((def.cost ?? 0) <= b.me.pp) v += 5;
  return v - Math.abs((def.cost ?? 0) - Math.max(1, b.me.pp)) * 0.5;
}

/** ChooseCards (theirs, shared with PlannerCloneAI): by what the selection is for and what the asking ability does. */
export function chooseCards(engine: Engine, b: SBattle, d: Extract<Decision, { type: "selectCards" }>, preferFace: boolean, chosen: Candidate | null = null, current = false): Answer {
  const none = { type: "selectCards" as const, cards: legalSelection(d.candidates, d.mandatory ?? [], d.min) };
  // A Ward follower put onto the field: their DoChoice ["竖直登场", "横置登场"] → the first option (it stays standing).
  if (d.reason === "wardEnterEngaged") return none;
  // A search: their DoChoice with "不检索" — DecideChoice takes the best SearchChoiceValue, never "不检索".
  if (d.reason === "search") {
    const order = d.candidates.map((id, i) => ({ id, v: searchValue(engine, d.candidateDefs[i] ?? "", b), i })).sort((x, y) => y.v - x.v || x.i - y.i);
    return { type: "selectCards", cards: legalSelection(order.map((x) => x.id), d.mandatory ?? [], Math.min(d.max, order.length)) };
  }
  const cards = d.candidates.map((id, i) => b.card(id) ?? defCard(engine, id, d.candidateDefs[i] ?? "", b.me.id));
  let count = Math.min(d.max, cards.length);
  if (count === 0) return none;
  const ability = sourceVector(engine, b, d.source, chosen, current);
  const purpose = d.reason === "cost" ? "cost" : d.reason === "discard" || d.reason === "handLimitDiscard" ? "discard" : "normal";
  const canChooseLess = d.min < count;
  if (purpose === "cost" && canChooseLess) {
    if (d.source !== null) return chosen !== null && chosen.source?.id === d.source && chosen.paid.length > 0 ? { type: "selectCards", cards: legalSelection([...cards].sort((x, y) => selectValue(engine, x, b) - selectValue(engine, y, b)).map((c) => c.id), d.mandatory ?? [], count) } : none;
    const value = ability ? roughAbility(ability, b) : 0;
    const costValue = [...cards].map((c) => selectValue(engine, c, b)).sort((x, y) => x - y).slice(0, count).reduce((s, v) => s + v, 0);
    if (value <= costValue * 1.1 + 5) return none;
  }
  let ordered: SCard[];
  if (purpose !== "normal") ordered = [...cards].sort((x, y) => selectValue(engine, x, b) - selectValue(engine, y, b));
  else if (ability && ability.damages.length > 0) {
    const damage = Math.max(...ability.damages.map((x) => x.base));
    ordered = [...cards].sort((x, y) => targetDamageScore(y, b, damage, preferFace) - targetDamageScore(x, b, damage, preferFace));
  } else if (ability && ability.removal > 0) {
    const v = (c: SCard) => (c.owner === b.me.id ? -boardValue(c, b) : boardValue(c, b));
    ordered = [...cards].sort((x, y) => v(y) - v(x));
  } else if (ability && (ability.heal > 0 || ability.attackBuff > 0 || ability.defense > 0)) {
    const v = (c: SCard) => (c.owner !== b.me.id ? -boardValue(c, b) : boardValue(c, b) + Math.max(0, c.maxHp - c.hp) * 5);
    ordered = [...cards].sort((x, y) => v(y) - v(x));
  } else {
    const v = (c: SCard) => (c.owner === b.me.id ? selectValue(engine, c, b) * 0.8 : selectValue(engine, c, b));
    ordered = [...cards].sort((x, y) => v(y) - v(x));
  }
  if (canChooseLess && purpose === "normal" && ability && !ability.hasMaterialBenefit) count = d.min;
  return { type: "selectCards", cards: legalSelection(ordered.map((c) => c.id), d.mandatory ?? [], count) };
}

/** DecideChoice: a search's options by the card they name (only with a "don't search" option, as theirs); others by their words (in English here). */
export function decideChoice(engine: Engine, b: SBattle, d: Extract<Decision, { type: "choose" }>): Answer {
  const n = Math.max(d.min, Math.min(1, d.max));
  const noSearch = d.options.findIndex((o) => /don't search|do not search/i.test(o.label));
  if (noSearch >= 0) {
    const named = (label: string) => engine.db.all().find((def) => def.name === label)?.id ?? "";
    const rest = d.options.map((o, i) => ({ o, i })).filter(({ i }) => i !== noSearch);
    if (rest.length > 0) return { type: "choose", ids: rest.sort((x, y) => searchValue(engine, named(y.o.label), b) - searchValue(engine, named(x.o.label), b) || x.i - y.i).slice(0, n).map(({ o }) => o.id) };
  }
  const score = (text: string, i: number) => {
    let v = -i * 0.01;
    if (/cancel|don't|do not|\bno\b|skip/i.test(text)) v -= 8;
    if (/draw|into your hand|add .* to your hand/i.test(text)) v += b.me.hand.length <= 5 ? 8 : 2;
    if (/damage|destroy|banish/i.test(text)) v += 7;
    if (/restore|recover|heal|leader \{\[defense\]\}\+/i.test(text)) v += b.me.hp <= 10 ? 9 : 2;
    if (/evolve/i.test(text)) v += 5;
    return v;
  };
  return { type: "choose", ids: d.options.map((o, i) => ({ id: o.id, v: score(o.label, i) })).sort((x, y) => y.v - x.v).slice(0, n).map((x) => x.id) };
}
