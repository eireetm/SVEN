// BP03-090 Princess Snow White — Havencraft follower, 2, 2/2. 信仰・童話・プリンセス.
// Ward.
// {[fanfare]} If put onto the field from your hand, put a Fable counter on it. Otherwise +1/+1.
// {[lastwords]} If this card had a Fable counter, put it into its owner's EX area.
// Counters are removed by the zone change (ruling, CR 15.1); the check uses look-back.
import { defineCard, fanfare, lastWords } from "../helpers";

function hadFable(fx: import("../../engine/effects/context").EffectContext): boolean {
  return (
    fx.event?.type === "cardsMoved" &&
    fx.event.moves.some((m) => m.newCard === fx.self && (m.before?.counters.fable ?? 0) > 0)
  );
}

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.enteredFrom(fx.self) === "hand") yield* fx.addCounters(fx.self, "fable", 1);
        else yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    lastWords({
      *resolve(fx) {
        if (hadFable(fx)) yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
