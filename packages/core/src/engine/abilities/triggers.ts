import type { DefId } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import type { GrantedAbilityId, PendingAbility, PlayerZone, TriggerData } from "../../model/state";
import type { GameEvent } from "../../events/types";
import type { AutomaticAbility, TriggerSubject } from "../../script/types";
import { cloneJson } from "../../util/json";
import type { G } from "../runtime/context";
import { nextSeq, recordUse, usesThisTurn } from "../state/access";
import { abilitiesLostAt, abilityZones, activeScript, hasKeyword, infoDefId, passiveSources } from "../state/characteristics";
import { makeReader, type GameReader } from "../query";
import { abilityKey, getAbility } from "./play-ability";
import { GRANT_ABILITIES, GRANT_PREFIX } from "./grants";
import { KEYWORD_ABILITIES, KEYWORD_DEF_PREFIX, KEYWORD_TRIGGERS } from "./keyword-abilities";
import { effectInForce } from "../state/effects";
import { EQUIP_PREFIX } from "./equipment";
import { unionBurstValid } from "./union-burst";

interface Candidate {
  subject: TriggerSubject;
  /** Definition providing the abilities. */
  abilityDef: DefId;
  /** Object the pending ability refers to as "this card" (CR 4.1.4.1: after the move). */
  source: CardId;
}

/**
 * Zones scanned for automatic abilities that work outside the field (`validIn`, a crest's in the EX area, CR 10.3.6, an
 * equipment token's in the equipment zone, 14.5.2.1.2).
 */
const OTHER_ZONES: readonly PlayerZone[] = ["hand", "ex", "cemetery", "banished", "leader", "equipmentZone"];

/**
 * BP19-092 "Your abilities that activate at the start of the end phase activate 1 additional time":
 * how many times an automatic ability of `controller` triggering on this event becomes pending
 * (either player's end phase; each card with it adds its number — rulings).
 */
function instances(g: G, event: GameEvent, controller: PlayerId): number {
  if (event.type !== "phaseStarted" || event.phase !== "end") return 1;
  let n = 1;
  for (const id of passiveSources(g, controller)) n += activeScript(g, id)?.field?.extraEndPhaseTriggers ?? 0;
  return n;
}

function matches(ability: AutomaticAbility, event: GameEvent, subject: TriggerSubject, reader: GameReader): TriggerData[] {
  const r = ability.trigger(event, subject, reader);
  if (r === true) return [{}];
  if (r === false) return [];
  return [...r];
}

/**
 * CR 10.7.2.2 — "[N] times per turn" ("once per turn": N = 1): the ability becomes pending at most
 * N times per turn, counted per card object (BP01-013, BP07-036 rulings). Counts this trigger when
 * it is allowed.
 */
function withinPerTurnLimit(g: G, ability: AutomaticAbility, source: CardId, key: string): boolean {
  const limit = ability.timesPerTurn ?? (ability.oncePerTurn ? 1 : undefined);
  const card = g.state.cards[source];
  if (limit === undefined || !card) return true;
  if (usesThisTurn(g.state, card, key) >= limit) return false;
  recordUse(g.state, card, key);
  return true;
}

function addPending(g: G, controller: PlayerId, source: CardId, sourceDef: DefId, ability: number, event: GameEvent, data: TriggerData): void {
  const seq = nextSeq(g.state);
  const pending: PendingAbility = {
    id: `p${seq}`,
    seq,
    controller,
    source,
    sourceDef,
    ability,
    event: cloneJson(event),
    data: Object.keys(data).length > 0 ? data : null,
  };
  g.state.pending.push(pending);
  g.emit({ type: "abilityTriggered", pendingId: pending.id, player: controller, source, sourceDef, ability });
}

/**
 * CR 10.7.2 — after every event, find automatic abilities whose trigger condition it
 * satisfies and make them pending (once per match, 10.7.2.1). Scanned:
 *  - cards in zones where each ability is valid (CR 10.3.5: field unless stated otherwise; 10.3.6:
 *    a crest's in the EX area);
 *  - cards that just moved in this event, with the information they had in the zone they
 *    left (look-back, CR 10.7.4.1 / 10.7.4.2) — e.g. Last Words, "when this is discarded";
 *  - delayed triggers created by effects (CR 10.7.5), which trigger only once (10.7.5.1).
 * A card that has lost all abilities (BP05-061) has no automatic abilities of its own, also for
 * look-back: its Last Words don't trigger (ruling).
 */
export function collectTriggers(g: G, event: GameEvent): void {
  if (g.state.phase === "over") return;
  const { state, scripts } = g;
  const candidates: Candidate[] = [];

  for (const p of [0, 1] as PlayerId[]) {
    for (const id of state.players[p].zones.field) {
      if (abilitiesLostAt(state, id) !== null) continue;
      candidates.push({ subject: { card: id, controller: p, zone: "field", lookBack: false }, abilityDef: infoDefId(g, id), source: id });
    }
    for (const zone of OTHER_ZONES) {
      for (const id of state.players[p].zones[zone]) {
        const def = state.cards[id]!.def;
        if (!scripts[def]?.abilities?.some((a) => a.kind === "automatic" && abilityZones(g, def, a).includes(zone))) continue;
        candidates.push({ subject: { card: id, controller: p, zone, lookBack: false }, abilityDef: def, source: id });
      }
    }
  }
  if (event.type === "cardsMoved") {
    for (const m of event.moves) {
      if (m.from === null || m.card === null || m.before === null || m.before.abilitiesLost) continue;
      candidates.push({
        subject: { card: m.card, controller: m.before.controller, zone: m.from.zone, lookBack: true },
        abilityDef: m.before.abilityDef,
        source: m.newCard ?? m.card,
      });
    }
  }

  const reader = makeReader(g);
  for (const c of candidates) {
    scripts[c.abilityDef]?.abilities?.forEach((ability, index) => {
      if (ability.kind !== "automatic" || ability.delayed) return;
      if (!abilityZones(g, c.abilityDef, ability).includes(c.subject.zone)) return; // CR 10.3.5 / 10.3.6
      if (ability.unionBurst && !unionBurstValid(g, c.source)) return; // CR 14.5.1.2
      for (const data of matches(ability, event, c.subject, reader)) {
        // "During your turn, whenever ..." (triggerIf); an "if" in the effect (condition) is only
        // checked when the ability is played (play-ability.ts, BP10-109 ruling).
        if (ability.triggerIf && !ability.triggerIf(reader, c.subject.controller, c.source)) continue;
        for (let k = instances(g, event, c.subject.controller); k > 0; k--) {
          if (!withinPerTurnLimit(g, ability, c.source, abilityKey(c.abilityDef, index))) break;
          addPending(g, c.subject.controller, c.source, c.abilityDef, index, event, data);
        }
      }
    });
  }

  // Given abilities of cards on the field, each gift its own instance (two copies both
  // trigger, BP03-083 ruling): those an effect gave (BP03-062, 083, 112) and those a card on
  // the field gives while it is there (BP03-011). The receiving card is the source.
  // Abilities given before the card lost all abilities are lost too (BP05-061 ruling).
  const granted: { card: CardId; grant: GrantedAbilityId }[] = [];
  const lostBefore = (card: CardId, seq: number) => {
    const at = abilitiesLostAt(state, card);
    return at !== null && seq <= at;
  };
  for (const e of state.effects) {
    if (e.change.kind !== "grantedAbility" || !effectInForce(state, e)) continue;
    if (state.cards[e.target]?.zone === "field" && !lostBefore(e.target, e.seq)) granted.push({ card: e.target, grant: e.change.grant });
  }
  const onField = [...state.players[0].zones.field, ...state.players[1].zones.field];
  for (const giver of [...passiveSources(g, 0), ...passiveSources(g, 1)]) {
    const grantsFor = activeScript(g, giver)?.field?.grantsFor;
    if (!grantsFor) continue;
    const since = state.cards[giver]!.zoneSeq;
    for (const card of onField) {
      if (lostBefore(card, since)) continue;
      for (const grant of grantsFor(reader, giver, card)) granted.push({ card, grant });
    }
  }
  for (const { card, grant } of granted) {
    const ability = GRANT_ABILITIES[grant];
    if (ability.kind !== "automatic") continue;
    const controller = state.cards[card]!.controller;
    const subject: TriggerSubject = { card, controller, zone: "field", lookBack: false };
    for (const data of matches(ability, event, subject, reader)) {
      if (ability.triggerIf && !ability.triggerIf(reader, controller, card)) continue;
      for (let k = instances(g, event, controller); k > 0; k--) {
        if (!withinPerTurnLimit(g, ability, card, abilityKey(`${GRANT_PREFIX}${grant}`, 0))) break;
        addPending(g, controller, card, `${GRANT_PREFIX}${grant}`, 0, event, data);
      }
    }
  }

  // CR 14.5.2 — automatic abilities an equipment token gives the follower it equips (CP04-T09 "Strike - ...", CP04-T11), one
  // set per token (two Precious Mementos give two Strikes — CP04-114 ruling Q11); lost with the follower's abilities if it
  // lost them after the token was linked (rulings).
  for (const p of [0, 1] as PlayerId[]) {
    for (const token of state.players[p].zones.equipmentZone) {
      const t = state.cards[token]!;
      const abilities = scripts[t.def]?.equipment?.abilities;
      const follower = t.linkedTo;
      if (!abilities || follower === undefined || state.cards[follower]?.zone !== "field" || lostBefore(follower, t.zoneSeq)) continue;
      const controller = state.cards[follower]!.controller;
      const subject: TriggerSubject = { card: follower, controller, zone: "field", lookBack: false };
      const def = `${EQUIP_PREFIX}${t.def}`;
      abilities.forEach((ability, index) => {
        if (ability.kind !== "automatic") return;
        if (ability.unionBurst && !unionBurstValid(g, follower)) return; // CR 14.5.1.2
        for (const data of matches(ability, event, subject, reader)) {
          if (ability.triggerIf && !ability.triggerIf(reader, controller, follower)) continue;
          for (let k = instances(g, event, controller); k > 0; k--) {
            if (!withinPerTurnLimit(g, ability, follower, `${abilityKey(def, index)}@${token}`)) break;
            addPending(g, controller, follower, def, index, event, data);
          }
        }
      });
    }
  }

  // Given automatic abilities of cards that just left the field, with the information they had
  // there (look-back, CR 10.7.4.1), e.g. BP07-038 "Last Words: Banish this follower."
  if (event.type === "cardsMoved") {
    for (const m of event.moves) {
      if (m.card === null || m.from === null || !m.before?.grants) continue;
      const subject: TriggerSubject = { card: m.card, controller: m.before.controller, zone: m.from.zone, lookBack: true };
      for (const grant of m.before.grants) {
        const ability = GRANT_ABILITIES[grant];
        if (ability.kind !== "automatic") continue;
        for (const data of matches(ability, event, subject, reader)) {
          if (ability.triggerIf && !ability.triggerIf(reader, m.before.controller, m.newCard ?? m.card)) continue;
          addPending(g, m.before.controller, m.newCard ?? m.card, `${GRANT_PREFIX}${grant}`, 0, event, data);
        }
      }
    }
  }

  // Automatic abilities a keyword stands for (CR 12.13 Drain); one instance per keyword even
  // if the card has it more than once (12.13.3).
  for (const card of onField) {
    for (const keyword of KEYWORD_TRIGGERS) {
      if (!hasKeyword(g, card, keyword)) continue;
      const controller = state.cards[card]!.controller;
      const subject: TriggerSubject = { card, controller, zone: "field", lookBack: false };
      KEYWORD_ABILITIES[keyword]!.forEach((ability, index) => {
        if (ability.kind !== "automatic") return;
        for (const data of matches(ability, event, subject, reader)) {
          addPending(g, controller, card, `${KEYWORD_DEF_PREFIX}${keyword}`, index, event, data);
        }
      });
    }
  }

  for (const d of [...state.delayed]) {
    const ability = getAbility(g, d.sourceDef, d.ability);
    if (ability.kind !== "automatic") continue;
    const subject: TriggerSubject = { card: d.source ?? "", controller: d.controller, zone: "field", lookBack: false };
    if (d.data) subject.delayedData = d.data; // what it watches (BP15-001)
    const hits = matches(ability, event, subject, reader);
    if (hits.length === 0) continue;
    const times = instances(g, event, d.controller);
    if (d.repeat) {
      // "For the rest of this turn, whenever ..." — a time frame is specified (CR 10.7.5.1).
      for (const hit of hits) for (let k = 0; k < times; k++) addPending(g, d.controller, d.source ?? "", d.sourceDef, d.ability, event, hit);
      continue;
    }
    state.delayed = state.delayed.filter((x) => x.id !== d.id); // CR 10.7.5.1
    for (let k = 0; k < times; k++) addPending(g, d.controller, d.source ?? "", d.sourceDef, d.ability, event, hits[0]!);
  }
}
