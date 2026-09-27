import { opponentOf, type PlayerId } from "../../model/ids";
import { randomInt } from "../../rng/rng";
import { drawCards, shuffleDeck } from "../actions/cards";
import { EngineError } from "../errors";
import type { G } from "../runtime/context";
import { anchor, decide } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { createCards, moveCards } from "../state/zones";
import { MAGICAL_ITEM } from "../../data/universes";

/** CR 6.2.1.6 — a random player decides who goes first (unless fixed by the game config). */
function* decideTurnOrder(g: G): Proc<PlayerId> {
  const fixed = g.state.config.firstPlayer;
  if (fixed !== null) return fixed;
  const chooser = randomInt(g.state.rng, 2) as PlayerId;
  const answer = yield* decide(g, { type: "chooseTurnOrder", player: chooser });
  if (answer.type !== "chooseTurnOrder") throw new EngineError("unreachable");
  g.emit({ type: "turnOrderChosen", player: chooser, goFirst: answer.goFirst });
  return answer.goFirst ? chooser : opponentOf(chooser);
}

/**
 * CR 6.2.1.8 — the player may put their whole hand on the bottom of the deck in any order
 * and draw the opening hand again (once).
 */
function* mulligan(g: G, player: PlayerId): Proc<void> {
  const hand = [...g.state.players[player].zones.hand];
  const answer = yield* decide(g, { type: "mulligan", player, hand });
  if (answer.type !== "mulligan") throw new EngineError("unreachable");
  if (answer.redraw) {
    const order = answer.bottomOrder ?? hand;
    moveCards(g, order.map((card) => ({ card, to: "deck" as const, position: "bottom" as const })), "mulligan");
    drawCards(g, player, g.state.config.rules.openingHand);
  }
  g.emit({ type: "mulligan", player, redraw: answer.redraw });
}

/**
 * CR 14.3.1.2 — before the first player is decided (6.2.1.6), a player whose deck is based on the THE IDOLM@STER
 * CINDERELLA GIRLS universe puts five Magical Item tokens into their EX area. Not optional (CP02-T01 ruling).
 */
function placeMagicalItems(g: G): void {
  for (const p of [0, 1] as PlayerId[]) {
    if (g.state.players[p].universe !== "cinderellaGirls") continue;
    const item = g.db.tokenNamed(MAGICAL_ITEM);
    if (!item) throw new EngineError(`no token named "${MAGICAL_ITEM}" (CR 14.3.1.2)`);
    const n = g.state.config.rules.magicalItemsAtStart;
    createCards(g, Array.from({ length: n }, () => ({ def: item.id, player: p, to: "ex" as const })), "setup");
  }
}

/**
 * CR 6.2 — before starting a game. Steps 6.2.1.1–6.2.1.3 and 6.2.1.5 (presenting decks,
 * placing leaders and evolve decks) happen when the initial state is built.
 */
export function* setupGame(g: G): Proc<void> {
  yield* anchor(g, { kind: "setup" });
  const { state } = g;
  const rules = state.config.rules;
  state.phase = "setup";

  for (const p of [0, 1] as PlayerId[]) shuffleDeck(g, p); // 6.2.1.4
  placeMagicalItems(g); // 14.3.1.2
  const first = yield* decideTurnOrder(g); // 6.2.1.6
  state.firstPlayer = first;
  const order: PlayerId[] = [first, opponentOf(first)];

  for (const p of order) drawCards(g, p, rules.openingHand); // 6.2.1.7
  for (const p of order) yield* mulligan(g, p); // 6.2.1.8 first player, then second

  for (const p of order) {
    const ps = state.players[p];
    ps.playPoints = 0; // 6.2.1.9
    ps.maxPlayPoints = 0;
    ps.evolutionPoints = rules.evolutionPoints[p === first ? 0 : 1]; // 6.2.1.10
    ps.superEvolutionPoints = rules.superEvolutionPoints; // 6.2.1.11
    ps.leaderDefense = rules.leaderDefense; // 6.2.1.12
    g.emit({ type: "playPointsChanged", player: p, playPoints: 0, maxPlayPoints: 0 });
    g.emit({
      type: "evolutionPointsChanged",
      player: p,
      evolutionPoints: ps.evolutionPoints,
      superEvolutionPoints: ps.superEvolutionPoints,
    });
    g.emit({ type: "leaderDefenseChanged", player: p, defense: ps.leaderDefense, delta: 0 }); // initial value, not a gain
  }
  // 6.2.1.13 abilities that apply "after redrawing": none in the supported sets.
  state.activePlayer = first; // 6.2.1.14
  g.emit({ type: "gameStarted", firstPlayer: first });
}
