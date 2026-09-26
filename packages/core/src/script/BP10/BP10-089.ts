// BP10-089 Silverbolt Hunter — Abysscraft follower, 1, 2/2. 吸血鬼・キラー.
// {[fanfare]} Deal 1 damage to your leader.
// {[lastwords]} Select a follower on your field and give it {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare, lastWords } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
      },
    }),
    lastWords({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
