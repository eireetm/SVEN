// BP04-109 Star Torrent — Havencraft spell, 4. 信仰・星神. Quick.
// Deal 3 damage to each engaged enemy follower on the field. If there is an amulet on your field,
// give your leader +2 defense.
import { defineCard, spell } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        const engaged = fx.game.followers(fx.game.opponent(fx.controller)).filter((id) => fx.game.card(id)?.engaged);
        yield* fx.dealDamageEach(engaged, 3);
        if (fx.game.cards(fx.controller, "field").some((id) => isAmulet(fx.game, id))) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
