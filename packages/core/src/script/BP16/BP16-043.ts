// BP16-043 Edelweiss, Sagelight Ward (Evolved) — Runecraft follower, 4/4. 魔法使い・ゴーレム.
// On Evolve - Summon a Strikeform Golem token. Put a Guardform Golem token into your EX area.
// On Super-Evolve - Draw 2 cards.
// Whenever a Golem follower is put onto your field, add 1 to a Stack on your field. (Each copy triggers, also
// during the opponent's turn — rulings.)
import { defineCard, onEvolve, onSuperEvolve, whenFollowerEntersYourField } from "../helpers";
import { golem } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Strikeform Golem"]);
        yield* fx.tokensToEx(["Guardform Golem"]);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* fx.addToStack(1);
        },
      },
      { filter: golem },
    ),
  ],
});
