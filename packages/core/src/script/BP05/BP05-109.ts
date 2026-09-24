// BP05-109 Feena, Dynamite Daredevil — Neutral follower, 2, 3/2. 傭兵.
// {[fanfare]} Choose one of the following. (1) Look at the top 5 cards of your deck. You may reveal
// a follower that costs 1 play point from among them and add it to your hand. Put the remaining
// cards on the bottom of your deck in any order. (2) Select an enemy follower that costs 1 play
// point on the field and destroy it. (元のコスト: printed cost. (2) can't be chosen without a
// target — ruling, CR 5.18.3.1.2.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, enemyFollower, isFollower } from "../targets";
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";

const costsOne = (g: GameReader, id: CardId) => g.info(id).cost === 1;

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "look",
          label: "Look at the top 5 cards",
          *resolve(fx) {
            yield* lookAtTopCards(fx, 5, { filter: and(isFollower, costsOne), to: "hand" });
          },
        },
        {
          id: "destroy",
          label: "Destroy an enemy follower that costs 1",
          targets: [enemyFollower({ filter: costsOne })],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0] ?? []);
          },
        },
      ],
    }),
  ],
});
