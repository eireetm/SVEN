// BP13-069 Coral Shark — Dragoncraft follower, 2, 3/1. 海洋.
// Rush.
// {[fanfare]} Give this follower {[attack]}+X, where X is the number of other Marine followers on your field.
import { defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

const marine = hasTrait("海洋");

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const x = fx.game.followers(fx.controller).filter((id) => id !== fx.self && marine(fx.game, id)).length;
        if (x > 0 && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, x, 0);
      },
    }),
  ],
});
