// CP02-103 New Generations — Neutral follower, 10, 5/5. デレマス・キュート・クール・パッション.
// When playing this card, banish 3 Cute cards, 3 Cool cards, and 3 Passion cards from your cemetery: This card costs 9 less to
// play.
// ----------
// Storm. Bane. Ward.
// (Rulings: a card with several of the types counts as a card of any one of them, and 9 different cards are banished — three
// such cards alone can't pay it. The cards are chosen one at a time, each time only among those that still let the rest be
// chosen.)
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard } from "../helpers";
import { cool, cute, passion } from "./shared";

type Filter = (g: GameReader, id: CardId) => boolean;
const SLOTS: readonly Filter[] = [cute, cute, cute, cool, cool, cool, passion, passion, passion];

/** Can each slot get a different card that matches it (a bipartite matching, Kuhn's algorithm)? */
function canFill(g: GameReader, cards: readonly CardId[], slots: readonly Filter[]): boolean {
  const owner = new Map<CardId, number>();
  const tryFill = (slot: number, seen: Set<CardId>): boolean => {
    for (const id of cards) {
      if (seen.has(id) || !slots[slot]!(g, id)) continue;
      seen.add(id);
      const other = owner.get(id);
      if (other === undefined || tryFill(other, seen)) {
        owner.set(id, slot);
        return true;
      }
    }
    return false;
  };
  return slots.every((_, slot) => tryFill(slot, new Set()));
}

const candidates = (g: GameReader, p: number) =>
  g.cards(p as 0 | 1, "cemetery").filter((id) => (cute(g, id) || cool(g, id) || passion(g, id)) && g.banishableByAbilities(id));

export default defineCard({
  keywords: ["storm", "bane", "ward"],
  playOptions: [
    {
      id: "banish9",
      label: "Banish 3 Cute, 3 Cool and 3 Passion cards from your cemetery: costs 9 less",
      costDelta: -9,
      canPay: (g, p) => canFill(g, candidates(g, p), SLOTS),
      *pay(fx) {
        const g = fx.game;
        let left = candidates(g, fx.controller);
        const chosen: CardId[] = [];
        for (let i = 0; i < SLOTS.length; i++) {
          const rest = SLOTS.slice(i + 1);
          const options = left.filter((id) => SLOTS[i]!(g, id) && canFill(g, left.filter((x) => x !== id), rest));
          const [pick] = yield* fx.chooseCards(options, 1, 1);
          chosen.push(pick!);
          left = left.filter((x) => x !== pick);
        }
        yield* fx.banish(chosen);
      },
    },
  ],
});
