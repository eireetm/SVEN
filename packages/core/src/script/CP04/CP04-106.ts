// CP04-106 Mahiru — Havencraft follower, 3, 3/3. プリコネ・エリザベスパーク.
// {[ub]} Activate {[engage]} this and another card on your field: Select an enemy follower on the field and put it into its owner's
// EX area. (An evolved follower goes there without its evolved card, a token stays a token, and a full EX area keeps it on the
// field — rulings, CR 4.8.3.2.)
// {[fanfare]} Search your deck for an Elizabeth Park card not named Mahiru, put it into your EX area, then shuffle.
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { activated, defineCard, fanfare, ub } from "../helpers";
import { enemyFollower, named } from "../targets";
import { elizabethPark } from "./shared";

const reservedOthers = (g: GameReader, c: PlayerId, self: CardId): CardId[] =>
  g.cards(c, "field").filter((id) => id !== self && g.card(id)?.engaged === false);

const engageAnother: CustomCost = {
  canPay: (g, c, self) => reservedOthers(g, c, self).length > 0,
  *pay(fx) {
    yield* fx.engage(yield* fx.chooseCards(reservedOthers(fx.game, fx.controller, fx.self), 1, 1));
  },
};

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true, custom: engageAnother },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.putIntoEx(fx.targets[0]!);
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => elizabethPark(fx.game, id) && !named("Mahiru")(fx.game, id), { to: "ex" });
      },
    }),
  ],
});
