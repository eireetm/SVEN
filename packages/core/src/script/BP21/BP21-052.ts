// BP21-052 Arcane Instruction — Runecraft spell, 2. 魔法使い・学院.
// When playing this, engage 2 Academic followers on your field: This costs 2 less. (CR 10.4.7.3.)
// Select a follower on your field. Give it {[attack]}+1/{[defense]}+1 and draw a card. (Needs a target — ruling.)
import { engageYourCards } from "../costs";
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";
import { academicFollower } from "./shared";

export default defineCard({
  playOptions: [{ id: "academic", label: "Engage 2 Academic followers on your field: 2 less", ...engageYourCards(academicFollower, 2), costDelta: -2 }],
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
