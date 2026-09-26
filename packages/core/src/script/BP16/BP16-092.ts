// BP16-092 Shadowcrypt Memorial — Abysscraft amulet, 1. 死霊術師・魔界.
// {[fanfare]} Bury the top card of your deck.
// Activate {[engage]} this, bury this: Summon a Ghost token. Activate only if a follower on your field evolved this
// turn. (A super-evolution counts — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { GHOST } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, p) => g.followerEvolvedThisTurn(p),
        *resolve(fx) {
          yield* fx.summon([GHOST]);
        },
      },
    ),
  ],
});
