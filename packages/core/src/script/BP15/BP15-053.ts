// BP15-053 Hermit of Truth — Runecraft follower, 3, 2/3. 絶傑・魔法使い.
// {[fanfare]} Select a follower in your cemetery with both the Omen and Mage traits not named Hermit of Truth and
// put it into your EX area. If this wasn't put onto the field from hand, the selected follower costs 3 less to
// play this turn. (EX area, deck, cemetery ... — ruling.)
import { defineCard, fanfare } from "../helpers";
import { inYourZone, named } from "../targets";
import { omenMageFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: (g, id) => omenMageFollower(g, id) && !named("Hermit of Truth")(g, id) })],
      *resolve(fx) {
        const [moved] = yield* fx.putIntoEx(fx.targets[0]!);
        if (moved !== undefined && fx.game.enteredFrom(fx.self) !== "hand") yield* fx.changePlayCost(moved, -3, "endOfTurn");
      },
    }),
  ],
});
