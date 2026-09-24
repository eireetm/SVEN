// BP04-092 Demonic Drummer — Abysscraft follower, 1, 1/1. 魔界・シンガー.
// Ward.
// {[fanfare]} {[cost02]} Search your deck for a Demonic Drummer and put it onto your field. (The one
// it puts out may pay for its own Fanfare too — ruling.)
// {[lastwords]} Give your leader +1 defense.
import { defineCard, fanfare, lastWords } from "../helpers";
import { playPointsCost } from "../costs";
import { named } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.search((id) => named("Demonic Drummer")(fx.game, id), { to: "field" });
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
