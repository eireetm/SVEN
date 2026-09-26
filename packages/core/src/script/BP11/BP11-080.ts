// BP11-080 Redcap — Abysscraft follower, 4, 5/4. 魔界.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there's an amulet on your field, give this follower Rush and Assail.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => g.cards(p, "field").some((id) => isAmulet(g, id)),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveKeyword(fx.self, "rush");
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
  ],
});
