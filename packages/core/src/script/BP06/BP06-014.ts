// BP06-014 Mallet Monkey — Forestcraft follower, 3, 2/1. 精霊・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// Storm.
// {[fanfare]} {[cost02]} Search your deck for a Mallet Monkey, summon it, then shuffle your deck.
// (The summoned one's Fanfare triggers too — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { playPointsCost } from "../costs";
import { named } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.search((id) => named("Mallet Monkey")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
