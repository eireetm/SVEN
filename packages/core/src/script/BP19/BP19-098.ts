// BP19-098 Executor of the Oath — Havencraft follower, 5, 4/4. 八獄・信仰.
// When playing this, engage an Erralde, Troth Convict on your field: This costs 0 to play.
// At the start of your end phase, select an enemy follower on the field and deal it 2 damage.
// {[fanfare]} Search your deck for an Agent of the Commandments or a Follower of the Precepts, summon it, then shuffle.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";
import { erraldeOption } from "./shared-haven";

const agent = named("Agent of the Commandments");
const precepts = named("Follower of the Precepts");

export default defineCard({
  playOptions: [erraldeOption],
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => agent(fx.game, id) || precepts(fx.game, id), { to: "field" });
      },
    }),
  ],
});
