// BP17-076 Mono, Immortal Garnet — Abysscraft follower, 3, 2/2. 機械・魔界.
// {[fanfare]} Summon an Assembly Droid token.
// Strike - Select an enemy follower on the field and deal it damage equal to the number of other Machina followers on your
// field.
// {[act]} {[cost00]}: Give this {[attack]}+1/{[defense]}+1 and Storm. Activate only if there are 5 Machina followers on
// your field, and only once per turn. (This follower counts toward the 5.)
import { activated, defineCard, fanfare, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { DROID, machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([DROID]);
      },
    }),
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        const others = fx.game.followers(fx.controller).filter((id) => id !== fx.self && machina(fx.game, id)).length;
        if (others > 0) yield* fx.dealDamage(fx.targets[0]![0]!, others);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: (g, c) => g.followers(c).filter((id) => machina(g, id)).length >= 5,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "field") return;
          yield* fx.giveStats(fx.self, 1, 1);
          yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});
