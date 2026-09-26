// BP12-T01 Carbuncle's Sparkle — Forestcraft spell token, 2. 精霊・獣.
// Choose one. (1) Select a follower on the field and return it to its owner's hand. (2) Give your leader
// {[defense]}+4. (3) Draw 2 cards. ((1) may select an enemy follower: "the field" is every player's —
// ruling.)
import { defineCard, spell } from "../helpers";
import { anyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "return",
          label: "(1) Return a follower to its owner's hand",
          targets: [anyFollower()],
          *resolve(fx) {
            yield* fx.returnToHand(fx.targets[0]!);
          },
        },
        {
          id: "defense",
          label: "(2) Your leader +4 defense",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 4);
          },
        },
        {
          id: "draw",
          label: "(3) Draw 2 cards",
          *resolve(fx) {
            yield* fx.draw(2);
          },
        },
      ],
    }),
  ],
});
