// BP17-112 Great Mother's Embrace — Neutral spell, 5. 自然・大神.
// Choose up to 2. (1) Select an enemy follower on the field and destroy it. (2) Search your deck for a Viridia Magna,
// summon it, then shuffle. (3) You may turn 2 faceup evolved Natura followers in your evolve deck facedown. If you do,
// draw a card and recover 2 play points.
// (Each option once; (1) can't be chosen without a target and its target is selected while playing; (3) turns exactly 2
// or nothing, and can be chosen with fewer — rulings, CR 5.18. Not advanced followers, CR 9.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isEvolvedFollower, named } from "../targets";
import { natura } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modeCount: () => 2,
      modes: [
        {
          id: "destroy",
          label: "(1) Destroy an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "search",
          label: "(2) A Viridia Magna from your deck onto the field",
          *resolve(fx) {
            yield* fx.search((id) => named("Viridia Magna")(fx.game, id), { to: "field" });
          },
        },
        {
          id: "facedown",
          label: "(3) Turn 2 faceup evolved Natura followers in your evolve deck facedown: draw a card, recover 2",
          *resolve(fx) {
            const g = fx.game;
            const faceUp = g.faceUpEvolveDeck(fx.controller).filter((id) => isEvolvedFollower(g, id) && natura(g, id));
            if (faceUp.length < 2 || !(yield* fx.confirm())) return;
            yield* fx.turnFacedown(yield* fx.chooseCards(faceUp, 2, 2));
            yield* fx.draw(1);
            yield* fx.recoverPlayPoints(2);
          },
        },
      ],
    }),
  ],
});
