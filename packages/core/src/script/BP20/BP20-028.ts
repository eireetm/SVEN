// BP20-028 Peppy Scout (Evolved) — 4/4.
// Once per turn, when an Officer follower is put onto your field, draw a card. (On the opponent's turn too — ruling.)
// On Evolve - Search your deck for a 3-cost or less Officer follower, summon it, then shuffle. (元のコスト.)
import { defineCard, onEvolve, whenFollowerEntersYourField } from "../helpers";
import { costAtMost, isFollower } from "../targets";
import { officer } from "./shared";

export default defineCard({
  abilities: [
    {
      ...whenFollowerEntersYourField(
        {
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
        { filter: officer },
      ),
      oncePerTurn: true,
    },
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && officer(g, id) && costAtMost(3)(g, id), { to: "field" });
      },
    }),
  ],
});
