// BP15-079 Ginsetsu, Terror Banquet — Abysscraft follower, 4, 3/5. 挑戦者・妖怪.
// {[fanfare]} Summon 2 One-Tailed Fox tokens.
// {[fanfare]} {[cost02]} Summon a One-Tailed Fox token. Give each other Yokai follower on your field {[attack]}+1.
// Whenever another Yokai follower you control leaves the field, select an enemy follower on the field. Deal 1
// damage to it and its leader. (Once per follower, also when this leaves with them, e.g. destroyed — rulings.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare, whenYourCardLeaves } from "../helpers";
import { enemyFollower } from "../targets";
import { yokai } from "./shared";
import { ONE_TAILED_FOX } from "./shared-abyss";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([ONE_TAILED_FOX, ONE_TAILED_FOX]);
      },
    }),
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.summon([ONE_TAILED_FOX]);
        for (const id of fx.game.followers(fx.controller)) if (id !== fx.self && yokai(fx.game, id)) yield* fx.giveStats(id, 1, 0);
      },
    }),
    whenYourCardLeaves(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 1);
        },
      },
      { filter: (m) => m.before?.type === "follower" && m.before.traits?.includes("妖怪") === true },
    ),
  ],
});
