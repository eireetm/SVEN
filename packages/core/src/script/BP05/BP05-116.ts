// BP05-116 Steel Demolitionist — Neutral follower, 2, 2/3. 傭兵・超克.
// {[fanfare]} Banish a card in your EX area: Select an enemy leader or enemy follower on the field and
// deal it 2 damage.
import { defineCard, fanfare } from "../helpers";
import { banishFromYourEx } from "../costs";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYourEx(() => true),
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
