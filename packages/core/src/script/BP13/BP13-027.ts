// BP13-027 Lounes, Levin Apprentice (Evolved) — Swordcraft follower, 2/2. 兵士・レヴィオン.
// On Evolve - You may summon a {[swordcraft]} follower with "Albert" in its name that costs X or less from
// your hand. X equals your max play points. (元のコスト.)
// During your turn, whenever a {[swordcraft]} follower with "Albert" in its name is put onto your field,
// {[cost01]}: Select an enemy follower on the field and deal it 3 damage.
import { defineCard, onEvolve, whenFollowerEntersYourField } from "../helpers";
import { playPointsCost } from "../costs";
import { costAtMost, enemyFollower } from "../targets";
import { yourTurn } from "./shared";
import { albertFollower } from "./shared-sword";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const max = fx.game.state.players[fx.controller].maxPlayPoints;
        const alberts = fx.game.cards(fx.controller, "hand").filter((id) => albertFollower(fx.game, id) && costAtMost(max)(fx.game, id));
        yield* fx.putOntoField(yield* fx.chooseCards(alberts, 0, 1));
      },
    }),
    whenFollowerEntersYourField(
      {
        triggerIf: yourTurn,
        cost: playPointsCost(1),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { filter: albertFollower },
    ),
  ],
});
