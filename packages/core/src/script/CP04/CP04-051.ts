// CP04-051 Hatsune — Runecraft follower, 3, 2/5. プリコネ・フォレスティエ.
// {[ub]} Activate {[engage]} this: Deal 2 damage to each enemy leader and enemy follower on the field.
// Ward.
// {[fanfare]} {[engage]} this.
import { activated, defineCard, fanfare, ub } from "../helpers";
import { damageEnemies } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          *resolve(fx) {
            yield* damageEnemies(fx, 2);
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.engage([fx.self]);
      },
    }),
  ],
});
