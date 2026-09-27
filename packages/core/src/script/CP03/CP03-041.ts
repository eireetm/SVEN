// CP03-041 Wingal Brave — Swordcraft amulet, 2. ヴァンガード・ロイヤルパラディン.
// Starting Amulet. (All cards with Starting Amulet in your deck must share the same name.) (CR 14.4.4, the engine's.)
// Activate {[engage]}, bury this card: Draw a card. Discard a card. Activate only if there's a Royal Paladin follower on your
// field.
import { activated, defineCard } from "../helpers";
import { followerThat, royalPaladin } from "./shared";

export default defineCard({
  keywords: ["startingAmulet"],
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.followers(c).some((id) => followerThat(royalPaladin)(g, id)),
        *resolve(fx) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
        },
      },
    ),
  ],
});
