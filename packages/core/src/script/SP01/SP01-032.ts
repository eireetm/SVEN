// SP01-032 Queen Vampire, Sultry Evening — Abysscraft follower, 5, 4/4. 吸血鬼.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
// At the start of your end phase, if there are at least 3 other Vampire cards on your field, deal 3 damage to each enemy leader and
// give your leader {[defense]}+3. (Both under the condition, checked when it resolves — open-questions Q6, Q10.)
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

const vampire = hasTrait("吸血鬼");

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        const others = fx.game.cards(fx.controller, "field").filter((id) => id !== fx.self && vampire(fx.game, id));
        if (others.length < 3) return;
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
