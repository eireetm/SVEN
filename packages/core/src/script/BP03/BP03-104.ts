// BP03-104 Birdkeeping Disciple — Havencraft follower, 4, 5/4. 信仰・鳥族.
// Ward.
// {[fanfare]} Engage an amulet on your field: Summon a Holy Falcon.
import { defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: {
        canPay: (g, c) => g.cards(c, "field").some((id) => isAmulet(g, id)),
        *pay(fx) {
          const amulets = fx.game.cards(fx.controller, "field").filter((id) => isAmulet(fx.game, id));
          const [id] = yield* fx.chooseCards(amulets, 1, 1);
          if (id) yield* fx.engage([id]);
        },
      },
      *resolve(fx) {
        yield* fx.summon(["Holy Falcon"]);
      },
    }),
  ],
});
