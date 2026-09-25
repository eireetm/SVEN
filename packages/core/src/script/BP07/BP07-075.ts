// BP07-075 Alpha Drive — Abysscraft spell, 1. 機械・魔界.
// Choose one of the following. (1) Select a Machina follower in your cemetery and add it to your
// hand. (2) Select a Mono, Garnet Rebel in your cemetery and summon it.
// (Mono may be selected for (1), then goes to the hand; without a card to select it can't be played
// — rulings.)
import { defineCard, spell } from "../helpers";
import { and, inYourZone, isFollower, named } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "hand",
          label: "(1) A Machina follower from your cemetery to your hand",
          targets: [inYourZone("cemetery", { filter: and(isFollower, machina) })],
          *resolve(fx) {
            yield* fx.returnToHand(fx.targets[0]!);
          },
        },
        {
          id: "summon",
          label: "(2) Summon a Mono, Garnet Rebel from your cemetery",
          targets: [inYourZone("cemetery", { filter: named("Mono, Garnet Rebel") })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
