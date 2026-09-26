// BP21-073 Cornelius, the Corpse King — Abysscraft follower, 4, 2/2. 死霊術師・学院.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select an Academic follower that costs 2 or less in your cemetery. Summon it and give it "At the start of your
// end phase, bury this." (元のコスト; the given ability stays after Cornelius leaves — ruling, CR 10.9.1.2.)
import { costAtMost, inYourZone } from "../targets";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { academicFollower } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("cemetery", { filter: (g, id) => academicFollower(g, id) && costAtMost(2)(g, id) })],
      *resolve(fx) {
        const [card] = yield* fx.putOntoField(fx.targets[0]!);
        if (card !== undefined) yield* fx.grant(card, "buryAtEnd");
      },
    }),
  ],
});
