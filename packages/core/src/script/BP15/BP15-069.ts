// BP15-069 Tropical Mermaid — Dragoncraft follower, 2, 2/2. 海洋.
// {[fanfare]} Select another Marine follower on your field and give it {[attack]}+1/{[defense]}+1. If this was
// played from the EX area, give {[attack]}+2/{[defense]}+2, Rush, and Assail instead. (Played, not put onto the
// field by an ability, CR 5.5.3.)
import { defineCard, enteredByAbility, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { marine } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: marine })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.enteredFrom(fx.self) === "ex" && !enteredByAbility(fx)) {
          yield* fx.giveStats(target, 2, 2);
          yield* fx.giveKeyword(target, "rush");
          yield* fx.giveKeyword(target, "assail");
        } else {
          yield* fx.giveStats(target, 1, 1);
        }
      },
    }),
  ],
});
