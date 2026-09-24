import type { DefId } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import type { PendingAbility, PlayerZone, TriggerData, ZoneName } from "../../model/state";
import type { GameEvent } from "../../events/types";
import type { AutomaticAbility, TriggerSubject } from "../../script/types";
import { cloneJson } from "../../util/json";
import type { G } from "../runtime/context";
import { nextSeq } from "../state/access";
import { infoDefId } from "../state/characteristics";
import { makeReader, type GameReader } from "../query";
import { abilityKey, getAbility } from "./play-ability";
import { GRANT_ABILITIES, GRANT_PREFIX } from "./grants";
import { effectInForce } from "../state/effects";

interface Candidate {
  subject: TriggerSubject;
  /** Definition providing the abilities. */
  abilityDef: DefId;
  /** Object the pending ability refers to as "this card" (CR 4.1.4.1: after the move). */
  source: CardId;
}

/** Zones scanned for automatic abilities that declare `validIn` other than the field. */
const OTHER_ZONES: readonly PlayerZone[] = ["hand", "ex", "cemetery", "banished", "leader"];

function matches(ability: AutomaticAbility, event: GameEvent, subject: TriggerSubject, reader: GameReader): TriggerData[] {
  const r = ability.trigger(event, subject, reader);
  if (r === true) return [{}];
  if (r === false) return [];
  return [...r];
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
 *  - cards in zones where each ability is valid (CR 10.3.5: field unless stated otherwise);
 *  - cards that just moved in this event, with the information they had in the zone they
 *    left (look-back, CR 10.7.4.1 / 10.7.4.2) — e.g. Last Words, "when this is discarded";
 *  - delayed triggers created by effects (CR 10.7.5), which trigger only once (10.7.5.1).
 */
export function collectTriggers(g: G, event: GameEvent): void {
  if (g.state.phase === "over") return;
  const { state, scripts } = g;
  const candidates: Candidate[] = [];

  for (const p of [0, 1] as PlayerId[]) {
    for (const id of state.players[p].zones.field) {
      candidates.push({ subject: { card: id, controller: p, zone: "field", lookBack: false }, abilityDef: infoDefId(g, id), source: id });
    }
    for (const zone of OTHER_ZONES) {
      for (const id of state.players[p].zones[zone]) {
        const def = state.cards[id]!.def;
        if (!scripts[def]?.abilities?.some((a) => a.kind === "automatic" && a.validIn?.includes(zone))) continue;
        candidates.push({ subject: { card: id, controller: p, zone, lookBack: false }, abilityDef: def, source: id });
      }
    }
  }
  if (event.type === "cardsMoved") {
    for (const m of event.moves) {
      if (m.from === null || m.card === null || m.before === null) continue;
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
      if (!(ability.validIn ?? (["field"] as readonly ZoneName[])).includes(c.subject.zone)) return;
      for (const data of matches(ability, event, c.subject, reader)) {
        if (ability.condition && !ability.condition(reader, c.subject.controller, c.source)) continue;
        if (ability.oncePerTurn) {
          const card = state.cards[c.source];
          const key = abilityKey(c.abilityDef, index);
          if (card?.abilityUses[key] === state.turn) continue; // CR 10.7.2.2
          if (card) card.abilityUses[key] = state.turn;
        }
        addPending(g, c.subject.controller, c.source, c.abilityDef, index, event, data);
      }
    });
  }

  // Abilities an effect gave a card on the field (BP03-062, 083, 112). Each effect is its own
  // instance, so two copies of the same gift both trigger (BP03-083 ruling).
  for (const e of state.effects) {
    if (e.change.kind !== "grantedAbility" || !effectInForce(state, e)) continue;
    const card = state.cards[e.target];
    if (!card || card.zone !== "field") continue;
    const ability = GRANT_ABILITIES[e.change.grant];
    const subject: TriggerSubject = { card: card.id, controller: card.controller, zone: "field", lookBack: false };
    for (const data of matches(ability, event, subject, reader)) {
      addPending(g, card.controller, card.id, `${GRANT_PREFIX}${e.change.grant}`, 0, event, data);
    }
  }

  for (const d of [...state.delayed]) {
    const ability = getAbility(g, d.sourceDef, d.ability);
    if (ability.kind !== "automatic") continue;
    const subject: TriggerSubject = { card: d.source ?? "", controller: d.controller, zone: "field", lookBack: false };
    const hits = matches(ability, event, subject, reader);
    if (hits.length === 0) continue;
    state.delayed = state.delayed.filter((x) => x.id !== d.id); // CR 10.7.5.1
    addPending(g, d.controller, d.source ?? "", d.sourceDef, d.ability, event, hits[0]!);
  }
}
