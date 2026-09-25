// BP09-117 Fount of Angels — Neutral amulet, 1. 天使.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal an Angel or Fallen Angel card from
// among them and add it to your hand. Put the rest on the bottom of your deck in any order.
// {[act]} {[engage]}, bury this card: Give your leader {[defense]}+1. Activate only if there are at least
// 2 Angel and/or Fallen Angel followers on your field. (A follower with both traits counts once —
// ruling.)
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { hasTrait, isFollower } from "../targets";

const angelic = (g: GameReader, id: CardId) => hasTrait("天使")(g, id) || hasTrait("堕天使")(g, id);

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: angelic, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.followers(c).filter((id) => isFollower(g, id) && angelic(g, id)).length >= 2,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
