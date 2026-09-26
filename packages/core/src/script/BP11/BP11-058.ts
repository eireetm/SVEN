// BP11-058 Dragon-Devouring Dread — Dragoncraft follower, 9, 8/8. 竜族・キラー.
// {[fanfare]} For each {[dragoncraft]} card that costs 7 or more in your cemetery, select up to 1 enemy
// follower on the field and banish it.
// {[act]} {[cost03]}, discard this card and a {[dragoncraft]} card that costs 7 or more: Increase your
// max play points by 1. Draw a card. (Valid in the hand — ruling, CR 10.3.5.)
import { activated, defineCard, fanfare } from "../helpers";
import { ANY, enemyFollower } from "../targets";
import { bigDragon, discardThisAndBigDragon } from "./shared-dragon";

export default defineCard({
  abilities: [
    fanfare({
      targets: [
        enemyFollower({
          count: ANY,
          upTo: true,
          max: (g, c) => g.cards(c, "cemetery").filter((id) => bigDragon(g, id)).length,
        }),
      ],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
    activated(
      { playPoints: 3, custom: discardThisAndBigDragon },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.increaseMaxPlayPoints(1);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
