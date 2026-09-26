// BP13-085 Bandage Connoisseur — Abysscraft follower, 6, 4/4. 死者.
// {[fanfare]}/{[lastwords]} Select an enemy follower on the field. Deal 4 damage to it and 1 damage to its
// leader.
import { defineCard, fanfare, lastWords, type TimingSpec } from "../helpers";
import { enemyFollower } from "../targets";

const smash: TimingSpec = {
  targets: [enemyFollower()],
  *resolve(fx) {
    const target = fx.targets[0]![0]!;
    yield* fx.dealDamages([
      { target, amount: 4 },
      { target: fx.game.leader(fx.game.controller(target)), amount: 1 },
    ]);
  },
};

export default defineCard({ abilities: [fanfare(smash), lastWords(smash)] });
