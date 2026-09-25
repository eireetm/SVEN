import type { DefId } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import type { AbilityDef, ActivatedAbility, EarthRiteSpec, Mode } from "../../script/types";
import { buryCards, setEngaged } from "../actions/cards";
import { canPayLeaderDefense, changeLeaderDefense } from "../actions/leader";
import { canPayPlayPoints, payPlayPoints } from "../actions/points";
import { earthRiteSources, payEarthRite } from "../costs";
import { makeEffectContext, type EffectInit } from "../effects/context";
import { EngineError } from "../errors";
import { chooseModes, chooseModeTargets, resolveModes } from "./modes";
import type { G } from "../runtime/context";
import { confirm } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { characteristics } from "../state/characteristics";
import { makeReader } from "../query";
import { KEYWORD_ABILITIES, KEYWORD_DEF_PREFIX } from "./keyword-abilities";
import { GRANT_ABILITIES, GRANT_PREFIX } from "./grants";
import { chooseTargets, targetsAvailable } from "./targets";
import { activationBlocked } from "../state/effects";
import { recordUse, usesThisTurn } from "../state/access";
import type { GrantedAbilityId } from "../../model/state";

/** The ability `index` of a definition (or of a keyword, for "kw:<keyword>" ids). */
export function getAbility(g: G, def: DefId, index: number): AbilityDef {
  const ability = def.startsWith(KEYWORD_DEF_PREFIX)
    ? KEYWORD_ABILITIES[def.slice(KEYWORD_DEF_PREFIX.length) as keyof typeof KEYWORD_ABILITIES]?.[index]
    : def.startsWith(GRANT_PREFIX)
      ? GRANT_ABILITIES[def.slice(GRANT_PREFIX.length) as GrantedAbilityId]
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
  let earthRite = modes.some((m) => m.earthRite);
  // Earth Rite of the whole ability, also one with options (BP07-038 "{[fanfare]}, Earth Rite:
  // Choose ..."): without it nothing would happen (13.3.3.2 "If you paid this additional cost").
  if (ability.earthRite) {
    if (earthRitePayable(g, ctrl, ability.earthRite)) earthRite = yield* confirm(g, ctrl, "earthRite", self);
    if (!earthRite && ability.earthRite.mode === "required") return; // nothing would happen
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
  };
  // 10.6.2.5 costs
  if (ability.cost) yield* ability.cost.pay(makeEffectContext(g, init));
  if (earthRite) yield* payEarthRite(g, ctrl, ability.earthRite?.count ?? 1, self);
  // 10.6.2.7
  g.emit({ type: "abilityPlayed", player: ctrl, source: self, sourceDef: pending.sourceDef, ability: pending.ability });
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
 * CR 8.3 / 10.6.2 — can `player` play activated ability `index` of `card` now?
 * Evolve abilities are handled by engine/abilities/evolve.ts.
 */
export function canPlayActivated(g: G, player: PlayerId, card: CardId, index: number, timing: "main" | "quick"): boolean {
  const c = g.state.cards[card];
  if (!c || c.controller !== player) return false;
  const found = activatedAbility(g, card, index);
  if (!found || found.ability.evolve) return false;
  const { ability, def } = found;
  // CR 10.3.5 — valid only on the field unless the text says otherwise (e.g. BP06-059, EX area).
  if (!(ability.validIn ?? ["field"]).includes(c.zone)) return false;
  if (timing === "quick" && !ability.quick) return false; // CR 12.3.3
  if (ability.oncePerTurn && usesThisTurn(g.state, c, abilityKey(def, index)) >= 1) return false;
  if (activationBlocked(g.state, card, false)) return false; // BP03-039/040
  if (ability.condition && !ability.condition(makeReader(g), player, card)) return false; // "can be activated if ..."
  // CR 10.6.2.1.2 — cannot be specified if the cost cannot be paid or targets are missing.
  const cost = ability.cost;
  if (!canPayPlayPoints(g, player, cost.playPoints ?? 0)) return false;
  if (cost.engageSelf && c.engaged) return false; // CR 10.4.6 needs a reserved card
  if (cost.leaderDefense && !canPayLeaderDefense(g, player, cost.leaderDefense)) return false;
  if (cost.custom && !cost.custom.canPay(makeReader(g), player, card)) return false;
  if (ability.earthRite?.mode === "required" && !earthRitePayable(g, player, ability.earthRite)) return false;
  return targetsAvailable(g, ability.targets, player, card);
}

/**
 * Cards whose activated abilities may be playable now: the player's field, plus cards in their
 * hand, EX area or cemetery that have an activated ability valid there (CR 10.3.5, e.g. BP06-079
 * in the hand, BP06-059 in the EX area, BP07-038 in the cemetery).
 */
export function cardsWithActivatedAbilities(g: G, player: PlayerId): CardId[] {
  const zones = g.state.players[player].zones;
  const elsewhere = (["hand", "ex", "cemetery"] as const).flatMap((zone) =>
    zones[zone].filter((id) =>
      g.scripts[g.state.cards[id]!.def]?.abilities?.some((a) => a.kind === "activated" && a.validIn?.includes(zone)),
    ),
  );
  return [...zones.field, ...elsewhere];
}

/** CR 10.6.2 — play and resolve an activated ability (not an evolve ability). */
export function* playActivatedAbility(g: G, player: PlayerId, card: CardId, index: number): Proc<void> {
  const found = activatedAbility(g, card, index);
  if (!found || found.ability.evolve) throw new EngineError(`${card}#${index} is not a playable activated ability`);
  const { ability, def } = found;
  // 10.6.2.2 optional additional cost: Earth Rite (13.3.3.2)
  let earthRite = ability.earthRite?.mode === "required";
  if (ability.earthRite?.mode === "optional" && earthRitePayable(g, player, ability.earthRite)) {
    earthRite = yield* confirm(g, player, "earthRite", card);
  }
  // 10.6.2.3 targets
  const targets = yield* chooseTargets(g, ability.targets, player, card);
  if (targets === null) throw new EngineError("activated ability played without legal targets");
  const init: EffectInit = { controller: player, self: card, sourceDef: def, targets, event: null, earthRitePaid: earthRite };
  // 10.6.2.5 pay the cost in the listed order (10.4.2.1)
  const cost = ability.cost;
  payPlayPoints(g, player, cost.playPoints ?? 0);
  if (cost.engageSelf) setEngaged(g, [card], true);
  if (cost.custom) yield* cost.custom.pay(makeEffectContext(g, init));
  if (cost.leaderDefense) changeLeaderDefense(g, player, -cost.leaderDefense);
  const c = g.state.cards[card];
  if (ability.oncePerTurn && c) recordUse(g.state, c, abilityKey(def, index));
  let self = card;
  if (cost.burySelf && g.state.cards[card]) self = buryCards(g, [card])[0] ?? card; // "this card" after it moved (4.1.4.1)
  if (earthRite) yield* payEarthRite(g, player, ability.earthRite?.count ?? 1, card);
  // 10.6.2.7
  g.emit({ type: "abilityPlayed", player, source: card, sourceDef: def, ability: index });
  // 10.6.2.8.2
  if (ability.resolve) yield* ability.resolve(makeEffectContext(g, { ...init, self }));
  g.state.revealed = []; // CR 5.21.1.1
}
