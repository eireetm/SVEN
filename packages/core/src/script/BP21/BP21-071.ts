// BP21-071 Stormscale — Dragoncraft follower, 6, 5/5. 竜族.
// (Once per turn,) whenever a non-{[dragoncraft]} card is put into your EX area, select an enemy follower on the field. Deal
// it 5 damage and give your leader {[defense]}+2. ("Once per turn" is in the Japanese and Chinese texts and the rulings, not
// in effect_en; CR 10.7.2.2. Not playable without a target, so no {[defense]}+2 either; on the opponent's turn too —
// rulings.)
// {[fanfare]} Do the following 2 times. "Put the top card of your deck into your EX area."
import { defineCard, fanfare, whenCardPutIntoYourEx } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    {
      ...whenCardPutIntoYourEx(
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 5);
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
        (g, id) => g.info(id).class !== "Dragoncraft",
      ),
      timesPerTurn: 1,
    },
    fanfare({
      *resolve(fx) {
        for (let i = 0; i < 2; i++) yield* fx.topToEx(1);
      },
    }),
  ],
});
