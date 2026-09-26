// BP10-039 Runie, Resolute Diviner — Runecraft follower, 2, 1/1. 魔法使い.
// {[fanfare]} Select up to 1 enemy follower on the field. Spellchain (5) - Deal it 3 damage. SC (10) -
// Deal 2 damage to each enemy leader. Give your leader {[defense]}+2. SC (15) - Put each Runie,
// Resolute Diviner from your cemetery into your EX area. SC (20) - Give each Runie, Resolute Diviner
// on your field and in your EX area {[attack]}+2/{[defense]}+2. (Playable with no enemy follower,
// the Spellchain parts still apply — ruling. The count is fixed when it starts resolving, CR
// 13.3.1.4.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";

const runie = named("Runie, Resolute Diviner");

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        const sc = fx.game.spellchainCount(fx.controller);
        const target = fx.targets[0]?.[0];
        if (sc >= 5 && target !== undefined) yield* fx.dealDamage(target, 3);
        if (sc >= 10) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
          yield* fx.giveLeaderDefense(fx.controller, 2);
        }
        if (sc >= 15) yield* fx.putIntoEx(fx.game.cards(fx.controller, "cemetery").filter((id) => runie(fx.game, id)));
        if (sc >= 20) {
          const runies = [...fx.game.cards(fx.controller, "field"), ...fx.game.cards(fx.controller, "ex")].filter((id) => runie(fx.game, id));
          for (const id of runies) yield* fx.giveStats(id, 2, 2);
        }
      },
    }),
  ],
});
