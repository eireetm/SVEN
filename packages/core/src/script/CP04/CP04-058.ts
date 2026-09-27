// CP04-058 Muimi — Dragoncraft follower, 2, 2/3. プリコネ.
// {[ub]}{[fanfare]} Draw a card. Discard a card. If Overflow is active for you, equip this with a Precious Memento token. If you have
// 10 max play points, give this {[attack]}+3. (Executed again by CP04-114, it equips another one — rulings.)
import { defineCard, fanfare, ub } from "../helpers";
import { tenMaxPlayPoints } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
          if (fx.game.overflow(fx.controller)) yield* fx.equip(fx.self, "Precious Memento");
          if (tenMaxPlayPoints(fx.game, fx.controller) && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 3, 0);
        },
      }),
    ),
  ],
});
