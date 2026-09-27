// CP01-070 The Will to Overtake — Havencraft amulet, 1. ウマ娘.
// {[fanfare]} Look at the top 3 cards of your deck. Put any number of cards from among them on the top of your deck in any
// order. Put any remaining cards on the bottom of your deck in any order. (Not revealed — ruling.)
// {[act]} {[cost02]}, {[engage]}, put this card into its owner's cemetery: Draw a card.
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(3);
        if (top.length === 0) return;
        yield* fx.lookAt(top);
        const keep = yield* fx.chooseCards(top, 0, top.length);
        yield* fx.bottomInAnyOrder(top.filter((id) => !keep.includes(id)));
        yield* fx.putOnDeckInAnyOrder(keep, "top");
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
