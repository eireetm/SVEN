// BP14-007 Illusions of Comfort — Forestcraft spell, 2. 宴楽・獣.
// This costs 1 less to play from the EX area.
// This costs 1 less to play if there's a Hozumi, Enchanting Hostess on your field. (Both can apply: 2 less
// — ruling.)
// ----------
// Select an enemy follower on the field. Return it to its owner's hand and give your leader {[defense]}+1.
// (Not playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { HOZUMI, namedOnYourField } from "./shared";

export default defineCard({
  playCost: (g, self, p) => (g.playZone(self) === "ex" ? -1 : 0) + (namedOnYourField(g, p, HOZUMI) ? -1 : 0),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
