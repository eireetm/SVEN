// BP20-084 Spirited Gravekeeper (Evolved) — 4/5.
// On Evolve - Select a 5-cost or less non-{[abysscraft]} follower and a 3-cost or less non-{[abysscraft]} follower in your
// cemetery and summon them. (Both must be selected, or it isn't played; with room for one, the player picks which — rulings;
// 元のコスト.)
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, inYourZone, isClass, isFollower } from "../targets";

const nonAbyss = (max: number) => (g: GameReader, id: CardId) => isFollower(g, id) && !isClass("Abysscraft")(g, id) && costAtMost(max)(g, id);

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: nonAbyss(5) }), { ...inYourZone("cemetery", { filter: nonAbyss(3) }), distinct: true }],
      *resolve(fx) {
        yield* fx.putOntoField([...fx.targets[0]!, ...fx.targets[1]!]);
      },
    }),
  ],
});
