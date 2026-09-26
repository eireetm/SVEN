// BP20-054 Ascetic of Wuxing — Runecraft follower, 2, 2/3. 陰陽師.
// {[fanfare]} Discard a card: Look at the top 3 cards of your deck. From among them, you may reveal an Onmyoji follower or a
// spell and add it to your hand. Put the rest on the bottom of your deck in any order. (CR 10.4.7.4.)
// Activate {[engage]} this: Summon a Paper Shikigami token. Activate only if there are at least 7 Onmyoji cards and/or
// spells in your cemetery. (A card that is both counts once — rulings.)
import { discardA } from "../costs";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { isFollower, isSpell } from "../targets";
import { onmyoji } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(() => true),
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: (g, id) => (isFollower(g, id) && onmyoji(g, id)) || isSpell(g, id), to: "hand" });
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => g.cards(c, "cemetery").filter((id) => onmyoji(g, id) || isSpell(g, id)).length >= 7,
        *resolve(fx) {
          yield* fx.summon(["Paper Shikigami"]);
        },
      },
    ),
  ],
});
