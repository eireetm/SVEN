// BP18-060 Tenka, Hot-Blooded Vice-Prez — Dragoncraft follower, 2, 3/2. 透京・ドラゴニュート・武闘竜人.
// Whenever a Draconic Duelist follower with at least 4 attack on your field attacks, select an enemy follower on the field
// and deal 1 damage to it and its leader.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a Draconic Duelist card from among them and add it to your
// hand. Put the rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { enemyFollower } from "../targets";
import { draconicDuelist } from "./shared";
import { whenBigDuelistAttacks } from "./shared-dragon";

export default defineCard({
  abilities: [
    whenBigDuelistAttacks({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 1);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: draconicDuelist, to: "hand" });
      },
    }),
  ],
});
