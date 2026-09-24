// BP02-108 Bahamut (Evolved) — 11/11.
// On Evolve: Destroy each amulet on the field.
// If there are at least 2 enemy followers on the field, this follower can't attack enemy leaders.
// (CR 8.4.3)
import { defineCard, onEvolve } from "../helpers";
import { isAmulet } from "../targets";
import { atLeastTwoEnemyFollowers } from "./shared";

export default defineCard({
  cannotAttackLeader: atLeastTwoEnemyFollowers,
  abilities: [
    onEvolve({
      *resolve(fx) {
        const all = [...fx.game.cards(fx.controller, "field"), ...fx.game.cards(fx.game.opponent(fx.controller), "field")];
        yield* fx.destroy(all.filter((id) => isAmulet(fx.game, id)));
      },
    }),
  ],
});
