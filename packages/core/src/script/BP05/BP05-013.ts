// BP05-013 Mechanical Bowman — Forestcraft follower, 4, 4/4. 狩人・超克.
// {[fanfare]} Banish a card in your EX area: Select an enemy follower on the field and deal it 5
// damage. (A token in the EX area pays the cost too — ruling.)
import { defineCard, fanfare } from "../helpers";
import { banishFromYourEx } from "../costs";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYourEx(() => true),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
