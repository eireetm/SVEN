import type { MainAction } from "../../model/decision";
import type { CardId, PlayerId } from "../../model/ids";
import type { CostSpec } from "../../script/types";
import { canPayLeaderDefense, changeLeaderDefense } from "../actions/leader";
import { payPlayPoints, spendPoints } from "../actions/points";
import { EngineError } from "../errors";
import { thisTurn } from "../state/turn-counts";
import { recordStatsGained } from "../actions/stats";
import type { G } from "../runtime/context";
import type { Proc } from "../runtime/proc";
import { getCard, nextSeq } from "../state/access";
import { activeScript, characteristics } from "../state/characteristics";
import { moveCards } from "../state/zones";
import { makeReader } from "../query";
import { makeEffectContext } from "../effects/context";
import { activationBlocked, effectInForce } from "../state/effects";
import { confirm, selectCards } from "../runtime/decide";

type EvolveAction = Extract<MainAction, { type: "evolve" }>;

/** CR 8.3.2.1 — only one evolve (or equivalent) ability per player per turn. */
export function evolveAbilityUsedThisTurn(g: G, p: PlayerId): boolean {
  return g.state.players[p].evolveAbilityTurn === g.state.turn;
}

/**
 * CR 8.3.2.2 — may this player play evolve abilities any number of times per turn (BP18-001 "You may
 * play any number of Evolve per turn" on their field)? Advanced activated abilities and other
 * equivalent abilities keep the limit of 8.3.2.1 (BP18-001 rulings).
 */
export function unlimitedEvolve(g: G, p: PlayerId): boolean {
  return g.state.players[p].zones.field.some((id) => activeScript(g, id)?.field?.unlimitedEvolve === true);
}

/** CR 12.2.4 — may this player pay a super-evolution point right now? */
export function canSuperEvolve(g: G, p: PlayerId): boolean {
  const ps = g.state.players[p];
  const required = g.state.config.rules.superEvolveTurnsPassed[p === g.state.firstPlayer ? 0 : 1];
  return ps.superEvolutionPoints >= 1 && ps.turnsPassed >= required;
}

/** An evolve-deck card that can be revealed for an evolution, and the face it is revealed with. */
export interface EvolveOption {
  card: CardId;
  /** CR 4.6.4 — reveal the back face of a double-faced card. */
  backFace: boolean;
}

/** Which evolved cards an evolution uses (CR 5.16.1.1.1 "unless specified otherwise"). */
export interface EvolveSpec {
  /** BP03-056: evolved followers with this string in their name. */
  nameIncludes?: string | undefined;
  /** BP09-004 "Evolve this follower into a Paula, Gentle Warmth or Paula, Passionate Warmth". */
  into?: readonly string[] | undefined;
}

/**
 * CR 5.16.1.1.1 / 12.2.2 — cards in the evolve deck area that correspond to a field card:
 * evolved cards with the same card name, unless the evolution specifies otherwise. Faceup cards
 * are not part of the evolve deck (CR 4.6.3) and cannot be used. For a double-faced card each
 * face that corresponds can be revealed (CR 4.6.4).
 */
export function correspondingEvolveCards(g: G, fieldCard: CardId, spec: EvolveSpec = {}): EvolveOption[] {
  const c = getCard(g.state, fieldCard);
  const name = characteristics(g, fieldCard).name;
  const corresponds = (faceName: string) =>
    spec.into !== undefined
      ? spec.into.includes(faceName)
      : spec.nameIncludes !== undefined
        ? faceName.includes(spec.nameIncludes)
        : faceName === name;
  const out: EvolveOption[] = [];
  for (const id of g.state.players[c.controller].zones.evolveDeck) {
    const e = getCard(g.state, id);
    const def = g.db.get(e.def);
    if (e.faceUp || !def.evolved) continue;
    if (corresponds(def.name)) out.push({ card: id, backFace: false });
    if (def.backFace !== undefined && corresponds(g.db.get(def.backFace).name)) out.push({ card: id, backFace: true });
  }
  return out;
}

export interface EvolvePayment {
  playPoints: number;
  evolutionPoints: number;
  superEvolutionPoints: number;
}

/**
 * "Change this card's Evolve cost to N" (BP05-048/052): the value of the latest such effect in
 * force on the card, or null.
 */
function evolveCostSetTo(g: G, card: CardId): number | null {
  let value: number | null = null;
  for (const e of g.state.effects) {
    if (e.target === card && e.change.kind === "evolveCostSet" && effectInForce(g.state, e)) value = e.change.value;
  }
  return value;
}

/** "This card's Evolve costs N less this turn" (BP07-086): the sum of such effects in force on the card. */
function evolveCostChangedBy(g: G, card: CardId): number {
  let sum = 0;
  for (const e of g.state.effects) {
    if (e.target === card && e.change.kind === "evolveCost" && effectInForce(g.state, e)) sum += e.change.amount;
  }
  return sum;
}

/**
 * CR 12.2.3 — 1 evolution point may be used in lieu of 1 play point (only if the cost
 * includes play points); CR 12.2.4 — optionally 1 super-evolution point more.
 * An effect or the card's own passive may have changed the play points of its evolve cost
 * (BP05-048/052, BP06-019, BP07-086).
 * null when the player cannot pay.
 */
export function evolvePayment(
  g: G,
  p: PlayerId,
  card: CardId,
  cost: CostSpec,
  useEvolutionPoint: boolean,
  superEvolve: boolean,
): EvolvePayment | null {
  const ps = g.state.players[p];
  const setTo = cost.playPoints !== undefined ? evolveCostSetTo(g, card) : null;
  // A passive change of this card's evolve cost (BP06-019) and changes by effects (BP07-086), after
  // a set value; never below 0 (BP06-019, BP07-086 rulings).
  const change =
    cost.playPoints !== undefined
      ? (activeScript(g, card)?.evolveCostChange?.(makeReader(g), card) ?? 0) + evolveCostChangedBy(g, card)
      : 0;
  const costPlayPoints = Math.max(0, (setTo ?? cost.playPoints ?? 0) + change);
  if (cost.leaderDefense && !canPayLeaderDefense(g, p, cost.leaderDefense)) return null; // CR 10.4.5
  if (cost.custom && !cost.custom.canPay(makeReader(g), p, card)) return null; // e.g. BP02-089 "Discard 3 cards"
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
  if (evolveAbilityUsedThisTurn(g, p) && !unlimitedEvolve(g, p)) return [];
  const out: EvolveAction[] = [];
  for (const card of g.state.players[p].zones.field) {
    const ch = characteristics(g, card);
    if (ch.evolved) continue; // CR 12.2.5
    ch.abilities.forEach(({ ability }, index) => {
      if (ability.kind !== "activated" || !ability.evolve) return;
      if (ability.condition && !ability.condition(makeReader(g), p, card)) return;
      if (activationBlocked(g.state, card, true)) return; // BP03-039 "except Evolve" still allows this
      // Identical evolve cards are interchangeable: offer one per definition and face.
      const seen = new Set<string>();
      const spec = { nameIncludes: ability.evolveNameIncludes, into: ability.evolveInto };
      for (const { card: evolveCard, backFace } of correspondingEvolveCards(g, card, spec)) {
        const key = `${getCard(g.state, evolveCard).def}|${backFace}`;
        if (seen.has(key)) continue;
        seen.add(key);
        for (const useEvolutionPoint of [false, true]) {
          for (const superEvolve of [false, true]) {
            if (evolvePayment(g, p, card, ability.cost, useEvolutionPoint, superEvolve)) {
              const action: EvolveAction = { type: "evolve", card, ability: index, evolveCard, useEvolutionPoint, superEvolve };
              if (backFace) action.backFace = true;
              out.push(action);
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
  const payment = evolvePayment(g, p, action.card, ref.ability.cost, action.useEvolutionPoint, action.superEvolve);
  if (!payment) throw new EngineError("evolve cost cannot be paid");
  payPlayPoints(g, p, payment.playPoints);
  if (ref.ability.cost.leaderDefense) changeLeaderDefense(g, p, -ref.ability.cost.leaderDefense);
  if (ref.ability.cost.custom) {
    const init = { controller: p, self: action.card, sourceDef: ch.def.id, targets: [], event: null };
    yield* ref.ability.cost.custom.pay(makeEffectContext(g, init));
  }
  spendPoints(g, p, payment.evolutionPoints, payment.superEvolutionPoints);
  // 10.6.2.7 — played; counts as this turn's evolve ability (8.3.2.1)
  g.state.players[p].evolveAbilityTurn = g.state.turn;
  g.emit({ type: "abilityPlayed", player: p, source: action.card, sourceDef: ch.def.id, ability: action.ability });
  // 10.6.2.8 — the revealed card (face, CR 4.6.4) is the specified card (5.16.1.1)
  evolveCard(g, action.card, action.evolveCard, action.superEvolve, action.backFace === true);
}

/**
 * CR 5.16 — evolve `fieldCard` using `evolveDeckCard`:
 * put the card into the evolve zone and link it (5.16.1); the follower keeps its state and
 * damage (5.16.2); a super-evolution also gives +1/+1 (12.2.4.1, 12.2.4.2). A double-faced card
 * is placed with the revealed face visible (CR 2.14.3, 4.6.4).
 * Returns the evolve-zone card, or null if nothing happened (5.16.4, 1.3.2).
 */
export function evolveCard(g: G, fieldCard: CardId, evolveDeckCard: CardId, superEvolve: boolean, backFace = false): CardId | null {
  const c = g.state.cards[fieldCard];
  if (!c || c.zone !== "field") return null;
  if (characteristics(g, fieldCard).evolved) return null; // 5.16.4
  const [linked] = moveCards(g, [{ card: evolveDeckCard, to: "evolveZone", player: c.controller, backFace }], "evolve");
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
      createdTurn: g.state.turn,
      change: { kind: "stats", attack: 1, defense: 1 },
    });
    c.superEvolved = true;
  }
  thisTurn(g.state, c.controller).evolved += 1; // BP16-018 "if a follower on your field evolved this turn"
  g.emit({ type: "evolved", card: fieldCard, evolveCard: linked, superEvolved: superEvolve });
  if (superEvolve) recordStatsGained(g, fieldCard, 1, 1); // 12.2.4.1 (BP11-114 ruling: it gains attack and defense)
  return linked;
}

/**
 * CR 5.16.1.1 — evolve `card` by an effect, not by playing its evolve ability (BP03-021):
 * no evolve cost, and it does not count as this turn's evolve ability (CR 8.3.2.1). The
 * controller may decline even when a corresponding card exists (official ruling). Returns
 * whether the follower evolved.
 * The player performing the effect (`by`) selects and reveals the corresponding card from the
 * card controller's evolve deck; they can't look at another player's evolve deck (CR 4.6.2), so
 * an effect of another player can't evolve it (BP07-104 ruling).
 */
export function* effectEvolve(g: G, card: CardId, by?: PlayerId): Proc<boolean> {
  const c = g.state.cards[card];
  if (!c || c.zone !== "field" || characteristics(g, card).evolved) return false; // 5.16.4
  if (by !== undefined && by !== c.controller) return false;
  // CR 5.16.1.1 — a card with the same name as the evolving card (a face of it, CR 4.6.4). The
  // faces of a double-faced card have names of their own, so e.g. Paula, Icy Warmth (BP09-004)
  // can't be evolved by an effect: only its evolve ability names its evolved cards.
  const options = correspondingEvolveCards(g, card);
  if (options.length === 0) return false;
  if (!(yield* confirm(g, c.controller, "effect", card))) return false;
  let chosen = options[0]!;
  if (options.length > 1) {
    // Faces have different names, so each card corresponds with at most one face.
    const picked = yield* selectCards(g, c.controller, "pick", options.map((o) => o.card), 1, 1, card);
    const option = options.find((o) => o.card === picked[0]);
    if (!option) return false;
    chosen = option;
  }
  return evolveCard(g, card, chosen.card, false, chosen.backFace) !== null;
}
