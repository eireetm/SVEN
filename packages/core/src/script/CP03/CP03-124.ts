// CP03-124 Godhawk, Ichibyoshi — Havencraft amulet, 2. ヴァンガード・オラクルシンクタンク.
// Starting Amulet. (All cards with Starting Amulet in your deck must share the same name.) (CR 14.4.4, the engine's.)
// Activate {[engage]}, bury this card: Look at the top 3 cards of your deck. Put any number of them on the top of your deck in any
// order. Put the rest on the bottom in any order. Activate only if there's an Oracle Think Tank follower on your field.
import { activated, defineCard } from "../helpers";
import { arrangeTop, followerThat, oracleThinkTank } from "./shared";

export default defineCard({
  keywords: ["startingAmulet"],
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.followers(c).some((id) => followerThat(oracleThinkTank)(g, id)),
        *resolve(fx) {
          yield* arrangeTop(fx, 3);
        },
      },
    ),
  ],
});
