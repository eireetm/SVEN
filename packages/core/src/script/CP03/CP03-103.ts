// CP03-103 Fullbau — Abysscraft amulet, 2. ヴァンガード・シャドウパラディン.
// Starting Amulet. (All cards with Starting Amulet in your deck must share the same name.) (CR 14.4.4, the engine's.)
// Activate {[engage]}, bury this card: Bury the top 2 cards of your deck. Activate only if there's a Shadow Paladin follower on
// your field.
import { activated, defineCard } from "../helpers";
import { followerThat, shadowPaladin } from "./shared";

export default defineCard({
  keywords: ["startingAmulet"],
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.followers(c).some((id) => followerThat(shadowPaladin)(g, id)),
        *resolve(fx) {
          yield* fx.mill(2);
        },
      },
    ),
  ],
});
