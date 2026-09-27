// CP01-046 Tamamo Cross — Dragoncraft follower, 2, 2/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Give this follower {[attack]}+1/{[defense]}+1. Select up to 1 enemy follower on the field and deal it 2 damage.
import { defineCard, onRace, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        for (const id of fx.targets[0] ?? []) yield* fx.dealDamage(id, 2);
      },
    }),
  ],
});
