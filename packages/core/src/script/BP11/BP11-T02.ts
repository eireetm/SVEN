// BP11-T02 Magitrain — Abysscraft amulet token, 5, 4/5. 荒野・乗物.
// {[act]} {[cost01]}, engage any number of followers that cost a total of 5 or more on your field:
// Maneuver this card. (For the rest of this turn, it becomes a follower with {[attack]}4/{[defense]}5.
// CR 5.32; base costs, 元のコスト.)
// Rush.
// Strike - Select an engaged enemy follower on the field. Destroy it and give your leader
// {[defense]}+2. (Without one it can't be played — ruling.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { activated, defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

const reserved = (g: GameReader, p: PlayerId): CardId[] => g.followers(p).filter((id) => g.card(id)?.engaged === false);
const costOf = (g: GameReader, id: CardId): number => g.info(id).cost ?? 0;

/** Engage followers one at a time until their costs total 5 or more. */
const engageCostFive: CustomCost = {
  canPay: (g, c) => reserved(g, c).reduce((sum, id) => sum + costOf(g, id), 0) >= 5,
  *pay(fx) {
    let total = 0;
    while (total < 5) {
      const left = reserved(fx.game, fx.controller);
      if (left.length === 0) return;
      const [card] = yield* fx.chooseCards(left, 1, 1);
      if (card === undefined) return;
      total += costOf(fx.game, card);
      yield* fx.engage([card]);
    }
  },
};

export default defineCard({
  keywords: ["rush"],
  abilities: [
    activated(
      { playPoints: 1, custom: engageCostFive },
      {
        *resolve(fx) {
          yield* fx.maneuver(fx.self);
        },
      },
    ),
    strike({
      targets: [enemyFollower({ filter: (g, id) => g.card(id)?.engaged === true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
