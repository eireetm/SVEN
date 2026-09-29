import type { DefId } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import type { AbilityDef, ActivatedAbility, AutomaticAbility, EarthRiteSpec, Mode } from "../../script/types";
import { buryCards, setEngaged } from "../actions/cards";
import { canPayLeaderDefense, changeLeaderDefense } from "../actions/leader";
import { canPayPlayPoints, payPlayPoints, spendPoints } from "../actions/points";
import { earthRiteSources, payEarthRite } from "../costs";
import { makeEffectContext, type EffectInit } from "../effects/context";
import { EngineError } from "../errors";
import { chooseModes, chooseModeTargets, resolveModes } from "./modes";
import { evolveAbilityUsedThisTurn } from "./evolve";
import { performableModes } from "../flow/play-card";
import type { G } from "../runtime/context";
import { chooseOptions, confirm } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { abilityZones, characteristics } from "../state/characteristics";
import { makeReader } from "../query";
import { KEYWORD_ABILITIES, KEYWORD_DEF_PREFIX } from "./keyword-abilities";
import { GRANT_ABILITIES, GRANT_PREFIX } from "./grants";
import { chooseTargets, targetsAvailable } from "./targets";
import { EQUIP_PREFIX } from "./equipment";
import { recordUnionBurst, unionBurstValid } from "./union-burst";
import { activationBlocked } from "../state/effects";
import { recordUse, usesThisTurn } from "../state/access";
import type { GrantedAbilityId } from "../../model/state";

/**
 * The ability `index` of a definition (or of a keyword, for "kw:<keyword>" ids; a given one, "grant:<id>"; one an equipment
 * token gives its equipped follower, "equip:<token definition>", CR 14.5.2).
 */
export function getAbility(g: G, def: DefId, index: number): AbilityDef {
  const ability = def.startsWith(KEYWORD_DEF_PREFIX)
    ? KEYWORD_ABILITIES[def.slice(KEYWORD_DEF_PREFIX.length) as keyof typeof KEYWORD_ABILITIES]?.[index]
    : def.startsWith(GRANT_PREFIX)
      ? GRANT_ABILITIES[def.slice(GRANT_PREFIX.length) as GrantedAbilityId]
      : def.startsWith(EQUIP_PREFIX)
        ? g.scripts[def.slice(EQUIP_PREFIX.length)]?.equipment?.abilities?.[index]
        : g.scripts[def]?.abilities?.[index];
  if (!ability) throw new EngineError(`${def} has no ability #${index}`);
  return ability;
}

export function abilityKey(def: DefId, index: number): string {
  return `${def}#${index}`;
}

function earthRitePayable(g: G, player: PlayerId, spec: EarthRiteSpec | undefined): boolean {
  return spec !== undefined && earthRiteSources(g, player, spec.count).length > 0;
}

/**
 * CR 10.7.3 — play and resolve one pending automatic ability, following CR 10.6.2.
 * One instance of its pending status is removed whether or not it could be played
 * (10.7.3, 10.7.3.2). Abilities with a cost ("when [event], [cost]: [effect]", 10.4.7.4) are
 * only played if the controller chooses to pay (BP01-119 ruling).
 */
export function* playPendingAbility(g: G, pendingId: string): Proc<void> {
  const i = g.state.pending.findIndex((p) => p.id === pendingId);
  if (i < 0) throw new EngineError(`no pending ability ${pendingId}`);
  const pending = g.state.pending[i]!;
  g.state.pending.splice(i, 1);

  const ability = getAbility(g, pending.sourceDef, pending.ability);
  if (ability.kind !== "automatic") throw new EngineError(`${pending.sourceDef}#${pending.ability} is not automatic`);
  const ctrl = pending.controller;
  const self = pending.source;
  const reader = makeReader(g);
  if (ability.condition && !ability.condition(reader, ctrl, self)) return;
  // BP04-038 "Its Fanfare abilities can't be performed": the triggered Fanfare is not played.
  if (ability.timing === "fanfare" && g.state.effects.some((e) => e.target === self && e.change.kind === "noFanfare")) return;

  // A required Earth Rite that can't be paid: nothing would happen (13.3.3.2), so nothing is asked.
  if (ability.earthRite?.mode === "required" && !earthRitePayable(g, ctrl, ability.earthRite)) return;
  // 10.6.2.2 choices: options (5.18), Earth Rite (13.3.3.2), whether to pay the cost (10.4.7.4)
  let modes: Mode[] = [];
  if (ability.modes) {
    const chosen = yield* chooseModes(g, ctrl, ability, self);
    if (chosen === null) return; // 10.7.3.2
    modes = chosen;
  }
  if (modes.length === 0 && !targetsAvailable(g, ability.targets, ctrl, self)) return; // 10.6.2.3.3 -> 10.7.3.2
  // Earth Rite of the whole ability, also one with options (BP07-038 "{[fanfare]}, Earth Rite:
  // Choose ..."): without it nothing would happen (13.3.3.2 "If you paid this additional cost").
  // An option's Earth Rite may be paid or not (BP10-050 ruling); unpaid, the option does nothing.
  let earthRite = false;
  const riteSpec: EarthRiteSpec | undefined = ability.earthRite ?? (modes.some((m) => m.earthRite) ? { mode: "optional" } : undefined);
  if (riteSpec) {
    if (earthRitePayable(g, ctrl, riteSpec)) earthRite = yield* confirm(g, ctrl, "earthRite", self);
    if (!earthRite && ability.earthRite?.mode === "required") return; // nothing would happen
  }
  if (ability.cost) {
    if (!ability.cost.canPay(reader, ctrl, self)) return;
    if (!(yield* confirm(g, ctrl, "optionalCost", self))) return;
  }
  // 10.6.2.3 targets (of each chosen option, 5.18.4)
  const targets = modes.length === 0 ? yield* chooseTargets(g, ability.targets, ctrl, self) : [];
  const modeTargets = yield* chooseModeTargets(g, ctrl, modes, self);
  if (targets === null || modeTargets === null) return;
  const init: EffectInit = {
    controller: ctrl,
    self,
    sourceDef: pending.sourceDef,
    targets,
    event: pending.event,
    data: pending.data,
    mode: null,
    earthRitePaid: earthRite,
    // A delayed trigger a spell created (CR 10.7.5) is not an ability of a card on the field.
    fieldAbility: abilityZones(g, pending.sourceDef, ability).includes("field") && !(g.db.has(pending.sourceDef) && g.db.get(pending.sourceDef).type === "spell"),
  };
  // Triggered by its source leaving the field: the card's information there (CR 10.7.4.1.2).
  const ev = pending.event;
  if (ev.type === "cardsMoved" && ev.moves.some((m) => (m.newCard ?? m.card) === self && m.before?.noDamage === true)) {
    init.lookBackNoDamage = true;
  }
  // 10.6.2.5 costs
  if (ability.cost) yield* ability.cost.pay(makeEffectContext(g, init));
  if (earthRite) yield* payEarthRite(g, ctrl, ability.earthRite?.count ?? 1, self);
  // 10.6.2.7
  g.emit({ type: "abilityPlayed", player: ctrl, source: self, sourceDef: pending.sourceDef, ability: pending.ability });
  if (ability.unionBurst) recordUnionBurst(g, ctrl, self, pending.sourceDef, pending.ability); // CR 14.5.1.3
  // 10.6.2.8.2 — resolved even if the source has changed zones (10.6.2.8.2.1, 10.7.7); chosen
  // options in listed order (5.18.1)
  if (modes.length > 0) {
    yield* resolveModes(modes, (m, i) => makeEffectContext(g, { ...init, targets: modeTargets[i]!, mode: m.id }));
  } else if (ability.resolve) {
    yield* ability.resolve(makeEffectContext(g, init));
  }
  g.state.revealed = []; // CR 5.21.1.1
}

function activatedAbility(g: G, card: CardId, index: number): { ability: ActivatedAbility; def: DefId } | null {
  const ref = characteristics(g, card).abilities[index];
  return ref && ref.ability.kind === "activated" ? { ability: ref.ability, def: ref.def } : null;
}

/**
 * CR 12.16.3 — the play points and evolution points an activated ability costs: an advanced
 * activated ability may use 1 evolution point in lieu of 1 play point. Null when that is not possible.
 */
function activationPoints(g: G, player: PlayerId, ability: ActivatedAbility, useEvolutionPoint: boolean): { playPoints: number; evolutionPoints: number } | null {
  const playPoints = ability.cost.playPoints ?? 0;
  if (!useEvolutionPoint) return { playPoints, evolutionPoints: 0 };
  if (!ability.advanced || playPoints < 1 || g.state.players[player].evolutionPoints < 1) return null;
  return { playPoints: playPoints - 1, evolutionPoints: 1 };
}

/**
 * CR 8.3 / 10.6.2 — can `player` play activated ability `index` of `card` now (paying 1 evolution
 * point in lieu of 1 play point when `useEvolutionPoint`, CR 12.16.3)?
 * Evolve abilities are handled by engine/abilities/evolve.ts.
 */
export function canPlayActivated(
  g: G,
  player: PlayerId,
  card: CardId,
  index: number,
  timing: "main" | "quick",
  useEvolutionPoint = false,
): boolean {
  const c = g.state.cards[card];
  if (!c || c.controller !== player) return false;
  const found = activatedAbility(g, card, index);
  if (!found || found.ability.evolve) return false;
  const { ability, def } = found;
  // CR 10.3.5 — valid only on the field unless the text says otherwise (e.g. BP06-059, EX area);
  // 10.3.6 — a crest's only in the EX area.
  if (!abilityZones(g, def, ability).includes(c.zone)) return false;
  if (timing === "quick" && !ability.quick) return false; // CR 12.3.3
  if (ability.unionBurst && !unionBurstValid(g, card)) return false; // CR 14.5.1.2
  const perTurn = activationsPerTurn(ability);
  if (perTurn !== null && usesThisTurn(g.state, c, abilityKey(def, index)) >= perTurn) return false;
  if (activationBlocked(g.state, card, false)) return false; // BP03-039/040
  if (ability.condition && !ability.condition(makeReader(g), player, card)) return false; // "can be activated if ..."
  // CR 12.16.3 / 8.3.2.1 — an advanced activated ability is equivalent to an evolve ability: one of
  // them per turn (BP14-018 ruling).
  if (ability.advanced && evolveAbilityUsedThisTurn(g, player)) return false;
  // CR 10.6.2.1.2 — cannot be specified if the cost cannot be paid or targets are missing.
  const cost = ability.cost;
  const points = activationPoints(g, player, ability, useEvolutionPoint);
  if (!points || !canPayPlayPoints(g, player, points.playPoints)) return false;
  if (cost.engageSelf && c.engaged) return false; // CR 10.4.6 needs a reserved card
  if (cost.leaderDefense && !canPayLeaderDefense(g, player, cost.leaderDefense)) return false;
  if (cost.custom && !cost.custom.canPay(makeReader(g), player, card)) return false;
  if (ability.earthRite?.mode === "required" && !earthRitePayable(g, player, ability.earthRite)) return false;
  // CR 5.18.3.1.2 — with options, at least one must be performable (each has its own targets).
  if (ability.modes) return performableModes(g, ability.modes, player, card).length > 0;
  return targetsAvailable(g, ability.targets, player, card);
}

/**
 * A manual operation (model/manual.ts): could activated ability `index` of `card` be played without its points, leader
 * defense, engaging and Earth Rite, and whatever limits it (timing, "once per turn", effects forbidding it)? Only where it is
 * valid (CR 10.3.5), with its targets (10.6.2.3.3), and when what the effect relies on holds: a cost made of cards or counters
 * that can be paid (it is still paid: BP03-001's X is the number of counters removed) and the ability's own condition (BP21-030
 * pays X and needs a card to summon for it).
 */
export function canPlayActivatedFree(g: G, card: CardId, index: number): boolean {
  const c = g.state.cards[card];
  const found = c ? activatedAbility(g, card, index) : null;
  if (!c || !found || found.ability.evolve) return false;
  const { ability, def } = found;
  if (!abilityZones(g, def, ability).includes(c.zone)) return false;
  if (ability.condition && !ability.condition(makeReader(g), c.controller, card)) return false;
  if (ability.cost.custom && !ability.cost.custom.canPay(makeReader(g), c.controller, card)) return false;
  if (ability.modes) return performableModes(g, ability.modes, c.controller, card).length > 0;
  return targetsAvailable(g, ability.targets, c.controller, card);
}

/** How many times per turn an activated ability can be played ("once per turn", BP08-084 "twice"), or null. */
function activationsPerTurn(ability: ActivatedAbility): number | null {
  return ability.timesPerTurn ?? (ability.oncePerTurn ? 1 : null);
}

/**
 * Cards whose activated abilities may be playable now: the player's field, plus cards in their
 * hand, EX area or cemetery that have an activated ability valid there (CR 10.3.5, e.g. BP06-079
 * in the hand, BP06-059 in the EX area, BP07-038 in the cemetery; 10.3.6 crests in the EX area).
 */
export function cardsWithActivatedAbilities(g: G, player: PlayerId): CardId[] {
  const zones = g.state.players[player].zones;
  const elsewhere = (["hand", "ex", "cemetery"] as const).flatMap((zone) =>
    zones[zone].filter((id) => {
      const def = g.state.cards[id]!.def;
      return g.scripts[def]?.abilities?.some((a) => a.kind === "activated" && abilityZones(g, def, a).includes(zone));
    }),
  );
  return [...zones.field, ...elsewhere];
}

/**
 * CR 10.6.2 — play and resolve an activated ability (not an evolve ability). `useEvolutionPoint`:
 * an advanced activated ability's 1 evolution point in lieu of 1 play point (CR 12.16.3).
 * `free`: a manual operation (model/manual.ts) — no points, leader defense or engaging are paid
 * (a required Earth Rite counts as paid, an optional one isn't offered; a custom cost of cards or
 * counters is still paid) and it doesn't count toward "once per turn".
 */
export function* playActivatedAbility(g: G, player: PlayerId, card: CardId, index: number, useEvolutionPoint = false, free = false): Proc<void> {
  const found = activatedAbility(g, card, index);
  if (!found || found.ability.evolve) throw new EngineError(`${card}#${index} is not a playable activated ability`);
  const { ability, def } = found;
  // 10.6.2.2 optional additional cost: Earth Rite (13.3.3.2)
  let earthRite = ability.earthRite?.mode === "required";
  if (!free && ability.earthRite?.mode === "optional" && earthRitePayable(g, player, ability.earthRite)) {
    earthRite = yield* confirm(g, player, "earthRite", card);
  }
  // 10.6.2.2 options (5.18)
  const modes = ability.modes ? yield* chooseModes(g, player, ability, card) : [];
  if (modes === null) throw new EngineError("activated ability played without a performable option");
  // An option's Earth Rite may be paid or not (BP10-050 ruling, 13.3.3.2).
  if (!free && !earthRite && modes.some((m) => m.earthRite) && earthRitePayable(g, player, { mode: "optional" })) {
    earthRite = yield* confirm(g, player, "earthRite", card);
  }
  // 10.6.2.3 targets (of each chosen option, 5.18.4)
  const targets = modes.length === 0 ? yield* chooseTargets(g, ability.targets, player, card) : [];
  const modeTargets = yield* chooseModeTargets(g, player, modes, card);
  if (targets === null || modeTargets === null) throw new EngineError("activated ability played without legal targets");
  const init: EffectInit = {
    controller: player,
    self: card,
    sourceDef: def,
    targets,
    event: null,
    earthRitePaid: earthRite,
    fieldAbility: abilityZones(g, def, ability).includes("field"),
  };
  // 10.6.2.5 pay the cost in the listed order (10.4.2.1)
  let self = card;
  const cost = ability.cost;
  if (!free) {
    const points = activationPoints(g, player, ability, useEvolutionPoint);
    if (!points) throw new EngineError("evolution point cannot be used for this ability");
    payPlayPoints(g, player, points.playPoints);
    spendPoints(g, player, points.evolutionPoints, 0);
    if (cost.engageSelf) setEngaged(g, [card], true);
  }
  // Paid when free too: the effect may depend on it (BP03-001's X counters removed, BP07-093's discarded card).
  if (cost.custom) yield* cost.custom.pay(makeEffectContext(g, init));
  if (!free) {
    if (cost.leaderDefense) changeLeaderDefense(g, player, -cost.leaderDefense);
    const c = g.state.cards[card];
    if (activationsPerTurn(ability) !== null && c) recordUse(g.state, c, abilityKey(def, index));
    if (cost.burySelf && g.state.cards[card]) self = buryCards(g, [card])[0] ?? card; // "this card" after it moved (4.1.4.1)
    if (earthRite) yield* payEarthRite(g, player, ability.earthRite?.count ?? 1, card);
    // 10.6.2.7 — an advanced activated ability counts as this turn's evolve ability (12.16.3, 8.3.2.1)
    if (ability.advanced) g.state.players[player].evolveAbilityTurn = g.state.turn;
  }
  g.emit({ type: "abilityPlayed", player, source: card, sourceDef: def, ability: index });
  if (ability.unionBurst) recordUnionBurst(g, player, card, def, index); // CR 14.5.1.3
  // 10.6.2.8.2 — chosen options in listed order (5.18.1)
  if (modes.length > 0) {
    yield* resolveModes(modes, (m, i) => makeEffectContext(g, { ...init, self, targets: modeTargets[i]!, mode: m.id }));
  } else if (ability.resolve) {
    yield* ability.resolve(makeEffectContext(g, { ...init, self }));
  }
  g.state.revealed = []; // CR 5.21.1.1
}

/**
 * The Union Burst abilities of `card` that `player` could execute without paying their costs now (CR 14.5.1.4): valid ones
 * (14.5.1.2) whose targets can be selected with X = 0 (10.6.2.3.3, 14.5.1.5). Timing, "once per turn" and "Activate only if"
 * don't apply: the ability is not activated by its controller (CP04-114 ruling Q4: a "once per turn" one already used this
 * turn can be executed).
 */
function freeUnionBursts(g: G, player: PlayerId, card: CardId): { def: DefId; index: number; ability: ActivatedAbility | AutomaticAbility }[] {
  const c = g.state.cards[card];
  if (!c || c.zone !== "field" || !unionBurstValid(g, card)) return [];
  const out: { def: DefId; index: number; ability: ActivatedAbility | AutomaticAbility }[] = [];
  for (const ref of characteristics(g, card).abilities) {
    const ability = ref.ability;
    if (ability.kind === "spell" || !ability.unionBurst || (ability.kind === "activated" && ability.evolve)) continue;
    const playable = ability.modes
      ? performableModes(g, ability.modes, player, card).length > 0
      : targetsAvailable(g, ability.targets, player, card, { free: true });
    if (playable) out.push({ def: ref.def, index: ref.index, ability });
  }
  return out;
}

/**
 * CR 14.5.1.4 — execute one of `card`'s Union Burst abilities without paying its cost (CP04-114): its controller chooses one
 * that can be played and plays it (10.6.2) as if its original cost did not exist — an automatic one ignoring its trigger
 * condition (14.5.1.4.1), with X = 0 (14.5.1.5). Nothing happens if none can be played (the selected follower has none, lost
 * its abilities, or has no targets — rulings Q2, Q5, Q7). Returns whether one was executed.
 */
export function* executeUnionBurst(g: G, player: PlayerId, card: CardId, source: CardId | null): Proc<boolean> {
  const playable = freeUnionBursts(g, player, card);
  if (playable.length === 0) return false;
  let chosen = playable[0]!;
  if (playable.length > 1) {
    const options = playable.map((p, i) => ({ id: String(i), label: `${p.def} ability ${p.index + 1} (${p.ability.kind === "activated" ? "activated" : p.ability.timing})` }));
    const [pick] = yield* chooseOptions(g, player, "unionBurst", options, 1, 1, source, card);
    chosen = playable[Number(pick ?? 0)]!;
  }
  const { ability, def, index } = chosen;
  // 10.6.2.2 options, 10.6.2.3 targets; no costs (10.6.2.5), so nothing is paid and X stays 0.
  const modes = ability.modes ? yield* chooseModes(g, player, ability, card) : [];
  if (modes === null) throw new EngineError("Union Burst ability executed without a performable option");
  const targets = modes.length === 0 ? yield* chooseTargets(g, ability.targets, player, card, { free: true }) : [];
  const modeTargets = yield* chooseModeTargets(g, player, modes, card);
  if (targets === null || modeTargets === null) throw new EngineError("Union Burst ability executed without legal targets");
  const init: EffectInit = { controller: player, self: card, sourceDef: def, targets, event: null, data: null, mode: null, memory: { x: 0 }, fieldAbility: true };
  // 10.6.2.7
  g.emit({ type: "abilityPlayed", player, source: card, sourceDef: def, ability: index });
  recordUnionBurst(g, player, card, def, index); // CR 14.5.1.3
  if (modes.length > 0) {
    yield* resolveModes(modes, (m, i) => makeEffectContext(g, { ...init, targets: modeTargets[i]!, mode: m.id }));
  } else if (ability.resolve) {
    yield* ability.resolve(makeEffectContext(g, init));
  }
  g.state.revealed = []; // CR 5.21.1.1
  return true;
}
