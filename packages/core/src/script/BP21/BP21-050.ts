// BP21-050 Wolf Whisperer (Evolved) — 4/4.
// On Evolve - Look at the top 5 cards of your deck. You may summon up to 2 followers with different classes that costs 4 or
// less from among them. Put the rest on the bottom of your deck in any order. (元のコスト; Neutral is a class, CR 2.2.2;
// one alone is fine — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const top = fx.topCards(5);
        const fits = top.filter((id) => isFollower(g, id) && costAtMost(4)(g, id));
        const chosen = [];
        const [first] = yield* fx.selectCards(fits, 0, 1, fx.controller, top);
        if (first !== undefined) {
          chosen.push(first);
          const others = fits.filter((id) => g.info(id).class !== g.info(first).class);
          const [second] = yield* fx.selectCards(others, 0, 1, fx.controller, top);
          if (second !== undefined) chosen.push(second);
        }
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => g.card(id)?.zone === "deck"));
      },
    }),
  ],
});
