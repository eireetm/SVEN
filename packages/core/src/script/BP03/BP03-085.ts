// BP03-085 Parade Raven — Abysscraft follower, 7, 6/6. 死者.
// {[fanfare]} Bury another follower on your field: Select a follower costing 5 or less in your
// cemetery and put it onto your field. The target is chosen before the cost (ruling), so the
// buried follower cannot be selected. Only your own followers can be buried (ruling).
import { defineCard, fanfare } from "../helpers";
import { inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: {
        canPay: (g, c, self) => g.followers(c).some((id) => id !== self),
        *pay(fx) {
          const cards = fx.game.followers(fx.controller).filter((id) => id !== fx.self);
          yield* fx.bury(yield* fx.chooseCards(cards, 1, 1));
        },
      },
      targets: [inYourZone("cemetery", { filter: (g, id) => isFollower(g, id) && (g.info(id).cost ?? 99) <= 5 })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0] ?? []);
      },
    }),
  ],
});
