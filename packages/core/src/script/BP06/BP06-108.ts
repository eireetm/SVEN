// BP06-108 Badb Catha — Neutral follower, 3, 2/3. 大神・光輝.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Choose one of the following. (1) Select another follower on your field and give it
// {[attack]}+1/{[defense]}+1. (2) Give your leader {[defense]}+2. (3) Look at the top 3 cards of
// your deck. Put any number of them on the top of your deck in any order. Put the rest on the bottom
// in any order. ((1) can't be chosen without a target — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      modes: [
        {
          id: "buff",
          label: "Give another follower +1/+1",
          targets: [anotherYourFollower()],
          *resolve(fx) {
            yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
          },
        },
        {
          id: "heal",
          label: "Give your leader +2 defense",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
        {
          id: "arrange",
          label: "Arrange the top 3 cards of your deck",
          *resolve(fx) {
            const top = fx.topCards(3);
            const keep = yield* fx.chooseCards(top, 0, top.length);
            yield* fx.bottomInAnyOrder(top.filter((id) => !keep.includes(id)));
            yield* fx.putOnDeckInAnyOrder(keep, "top");
          },
        },
      ],
    }),
  ],
});
