// ECP01-015 Symboli Kris S — Swordcraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Storm.
// Activate {[engage]} 4 other Umamusume cards on your field: Give this follower {[attack]}+5. (Reserved ones, CR 10.4.6.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { activated, defineCard, serveAbility } from "../helpers";
import { umamusume } from "./shared";

const others = (g: GameReader, c: PlayerId, self: CardId) =>
  g.cards(c, "field").filter((id) => id !== self && umamusume(g, id) && g.card(id)?.engaged === false);

const engageFourOthers: CustomCost = {
  canPay: (g, c, self) => others(g, c, self).length >= 4,
  *pay(fx) {
    yield* fx.engage(yield* fx.chooseCards(others(fx.game, fx.controller, fx.self), 4, 4));
  },
};

export default defineCard({
  keywords: ["storm"],
  abilities: [
    serveAbility(1, 1),
    activated(
      { custom: engageFourOthers },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 5, 0);
        },
      },
    ),
  ],
});
