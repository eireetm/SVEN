// BP21-051 Evamia, Spinner of Threads — Runecraft follower, 2, 2/1. 超克.
// {[fanfare]} Banish the top card of your deck. Then, if there are at least 5 cards in your banished zone, summon a Mystic
// Artifact token. (Counted after banishing — ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(1);
        if (top.length > 0) yield* fx.banish(top);
        if (fx.game.cards(fx.controller, "banished").length >= 5) yield* fx.summon(["Mystic Artifact"]);
      },
    }),
  ],
});
