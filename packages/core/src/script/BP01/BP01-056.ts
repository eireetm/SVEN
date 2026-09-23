// BP01-056 Arcane Enlightenment — Runecraft spell, 4. {[quick]}
// Put the top card of your deck into your EX area. Repeat until your EX area is full.
// At the start of your next end phase, banish each card in your EX area.
// (A delayed trigger, CR 10.7.5: only your own end phase; tokens are banished too — rulings.)
import { defineCard, delayedAtStartOfYourEndPhase, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.topToEx(99);
        yield* fx.delay(1);
      },
    }),
    delayedAtStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.banish(fx.game.cards(fx.controller, "ex"));
      },
    }),
  ],
});
