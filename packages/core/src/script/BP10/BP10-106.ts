// BP10-106 Prismaplume Bird — Havencraft follower, 4, 2/2. 鳥族.
// {[fanfare]} Choose one. (1) Summon a Holy Falcon token. (2) Select an amulet in your cemetery and add
// it to your hand. ((2) can't be chosen without an amulet there — ruling.)
import { defineCard, fanfare } from "../helpers";
import { inYourZone, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "falcon",
          label: "(1) Summon a Holy Falcon token",
          *resolve(fx) {
            yield* fx.summon(["Holy Falcon"]);
          },
        },
        {
          id: "amulet",
          label: "(2) Add an amulet from your cemetery to your hand",
          targets: [inYourZone("cemetery", { filter: isAmulet })],
          *resolve(fx) {
            yield* fx.returnToHand(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
