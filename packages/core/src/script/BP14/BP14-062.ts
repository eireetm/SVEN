// BP14-062 Leviathan, the Furious — Dragoncraft follower, 4, 5/4. 竜族・海洋.
// {[fanfare]} Select an enemy follower on the field. It doesn't refresh during its controller's next start
// phase.
// At the start of your end phase, select an engaged enemy follower on the field and deal it 2 damage. If
// Overflow is active for you, deal 4 damage instead.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.skipNextRefresh(fx.targets[0]![0]!);
      },
    }),
    atStartOfYourEndPhase({
      targets: [enemyFollower({ filter: (g, id) => g.card(id)?.engaged === true })],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.overflow(fx.controller) ? 4 : 2);
      },
    }),
  ],
});
