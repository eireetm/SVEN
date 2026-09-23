import type { MainAction } from "../../model/decision";
import type { CardId, PlayerId } from "../../model/ids";
import type { CostSpec } from "../../script/types";
import { canPayLeaderDefense, changeLeaderDefense } from "../actions/leader";
import { payPlayPoints, spendPoints } from "../actions/points";
import { EngineError } from "../errors";
import type { G } from "../runtime/context";
import type { Proc } from "../runtime/proc";
import { getCard, nextSeq } from "../state/access";
import { characteristics } from "../state/characteristics";
import { moveCards } from "../state/zones";

type EvolveAction = Extract<MainAction, { type: "evolve" }>;

/** CR 8.3.2.1 — only one evolve (or equivalent) ability per player per turn. */
export function evolveAbilityUsedThisTurn(g: G, p: PlayerId): boolean {
  return g.state.players[p].evolveAbilityTurn === g.state.turn;
}

/** CR 12.2.4 — may this player pay a super-evolution point right now? */
export function canSuperEvolve(g: G, p: PlayerId): boolean {
  const ps = g.state.players[p];
  const required = g.state.config.rules.superEvolveTurnsPassed[p === g.state.firstPlayer ? 0 : 1];
  return ps.superEvolutionPoints >= 1 && ps.turnsPassed >= required;
}

/**
 * CR 5.16.1.1.1 / 12.2.2 — cards in the evolve deck area that correspond to a field card:
 * evolved cards with the same card name. Faceup cards are not part of the evolve deck
 * (CR 4.6.3) and cannot be used.
 */
export function correspondingEvolveCards(g: G, fieldCard: CardId): CardId[] {
  const c = getCard(g.state, fieldCard);
  const name = characteristics(g, fieldCard).name;
  return g.state.players[c.controller].zones.evolveDeck.filter((id) => {
    const e = getCard(g.state, id);
    const def = g.db.get(e.def);
    return !e.faceUp && def.evolved && def.name === name;
  });
}

export interface EvolvePayment {
  playPoints: number;
  evolutionPoints: number;
  superEvolutionPoints: number;
}

/**
 * CR 12.2.3 — 1 evolution point may be used in lieu of 1 play point (only if the cost
 * includes play points); CR 12.2.4 — optionally 1 super-evolution point more.
 * null when the player cannot pay.
 */
export function evolvePayment(
  g: G,
  p: PlayerId,
  cost: CostSpec,
  useEvolutionPoint: boolean,
  superEvolve: boolean,
): EvolvePayment | null {
  const ps = g.state.players[p];
  const costPlayPoints = cost.playPoints ?? 0;
  if (cost.leaderDefense && !canPayLeaderDefense(g, p, cost.leaderDefense)) return null; // CR 10.4.5
  let playPoints = costPlayPoints;
  let evolutionPoints = 0;
  if (useEvolutionPoint) {
    if (costPlayPoints < 1 || ps.evolutionPoints < 1) return null;
    playPoints -= 1;
    evolutionPoints = 1;
  }
  if (superEvolve && !canSuperEvolve(g, p)) return null;
  if (ps.playPoints < playPoints) return null;
  return { playPoints, evolutionPoints, superEvolutionPoints: superEvolve ? 1 : 0 };
}

/** Legal evolve actions for the main phase (CR 8.3, 12.2). */
export function evolveActions(g: G, p: PlayerId): EvolveAction[] {
  if (evolveAbilityUsedThisTurn(g, p)) return [];
  const out: EvolveAction[] = [];
  for (const card of g.state.players[p].zones.field) {
    const ch = characteristics(g, card);
    if (ch.evolved) continue; // CR 12.2.5
    ch.abilities.forEach(({ ability }, index) => {
      if (ability.kind !== "activated" || !ability.evolve) return;
      // Identical evolve cards are interchangeable: offer one per definition.
      const seen = new Set<string>();
      for (const evolveCard of correspondingEvolveCards(g, card)) {
        const def = getCard(g.state, evolveCard).def;
        if (seen.has(def)) continue;
        seen.add(def);
        for (const useEvolutionPoint of [false, true]) {
          for (const superEvolve of [false, true]) {
            if (evolvePayment(g, p, ability.cost, useEvolutionPoint, superEvolve)) {
              out.push({ type: "evolve", card, ability: index, evolveCard, useEvolutionPoint, superEvolve });
            }
          }
        }
      }
    });
  }
  return out;
}

/** CR 10.6.2 applied to an evolve ability (CR 12.2), which resolves as "Evolve this follower". */
export function* playEvolveAbility(g: G, p: PlayerId, action: EvolveAction): Proc<void> {
  const ch = characteristics(g, action.card);
  const ref = ch.abilities[action.ability];
  if (!ref || ref.ability.kind !== "activated" || !ref.ability.evolve) {
    throw new EngineError(`${action.card}#${action.ability} is not an evolve ability`);
  }
  // 10.6.2.5 — cost: reveal the corresponding card (12.2.2), pay play / evolution points
  // (12.2.3) and optionally a super-evolution point (12.2.4).
  const payment = evolvePayment(g, p, ref.ability.cost, action.useEvolutionPoint, action.superEvolve);
  if (!payment) throw new EngineError("evolve cost cannot be paid");
  payPlayPoints(g, p, payment.playPoints);
  if (ref.ability.cost.leaderDefense) changeLeaderDefense(g, p, -ref.ability.cost.leaderDefense);
  spendPoints(g, p, payment.evolutionPoints, payment.superEvolutionPoints);
  // 10.6.2.7 — played; counts as this turn's evolve ability (8.3.2.1)
  g.state.players[p].evolveAbilityTurn = g.state.turn;
  g.emit({ type: "abilityPlayed", player: p, source: action.card, sourceDef: ch.def.id, ability: action.ability });
  // 10.6.2.8 — the revealed card is the specified card (5.16.1.1)
  evolveCard(g, action.card, action.evolveCard, action.superEvolve);
}

/**
 * CR 5.16 — evolve `fieldCard` using `evolveDeckCard`:
 * put the card into the evolve zone and link it (5.16.1); the follower keeps its state and
 * damage (5.16.2); a super-evolution also gives +1/+1 (12.2.4.1, 12.2.4.2).
 * Returns the evolve-zone card, or null if nothing happened (5.16.4, 1.3.2).
 */
export function evolveCard(g: G, fieldCard: CardId, evolveDeckCard: CardId, superEvolve: boolean): CardId | null {
  const c = g.state.cards[fieldCard];
  if (!c || c.zone !== "field") return null;
  if (characteristics(g, fieldCard).evolved) return null; // 5.16.4
  const [linked] = moveCards(g, [{ card: evolveDeckCard, to: "evolveZone", player: c.controller }], "evolve");
  if (linked === undefined) throw new EngineError("evolve card vanished");
  c.evolvedWith = linked;
  c.evolvedTurn = g.state.turn;
  if (superEvolve) {
    const seq = nextSeq(g.state);
    g.state.effects.push({
      id: `e${seq}`,
      seq,
      target: fieldCard,
      source: fieldCard,
      controller: c.controller,
      until: null,
      change: { kind: "stats", attack: 1, defense: 1 },
    });
    c.superEvolved = true;
  }
  g.emit({ type: "evolved", card: fieldCard, evolveCard: linked, superEvolved: superEvolve });
  return linked;
}
