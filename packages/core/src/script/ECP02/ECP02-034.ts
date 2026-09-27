// ECP02-034 Shiki Ichinose [Mystic Elixir] — Runecraft follower, 4, 4/4. デレマス・キュート.
// {[fanfare]} Look at the top 3 cards of your deck. From among them, you may reveal up to 1 Cute card, up to 1 Cool card, and up to
// 1 Passion card and add them to your hand. Put the rest on the bottom of your deck in any order. (A card with several of the types
// may be taken as any one of them — ruling; chosen one at a time, each time only among those that still fit.)
// {[act]} Lesson (2), {[engage]}: Select an enemy follower on the field and deal it 4 damage.
import type { CardId } from "../../model/ids";
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { TYPES, canAssign } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const top = fx.topCards(3);
        const chosen: CardId[] = [];
        for (;;) {
          const options = top.filter((id) => !chosen.includes(id) && canAssign(g, [...chosen, id], TYPES));
          const [pick] = options.length > 0 ? yield* fx.selectCards(options, 0, 1, fx.controller, top) : [];
          if (pick === undefined) break;
          chosen.push(pick);
        }
        if (chosen.length > 0) {
          yield* fx.reveal(chosen);
          yield* fx.returnToHand(chosen);
        }
        yield* fx.bottomInAnyOrder(top.filter((id) => g.card(id)?.zone === "deck"));
      },
    }),
    activated(
      { engageSelf: true, custom: lesson(2) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        },
      },
    ),
  ],
});
