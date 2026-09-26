// BP10-112 Starbright Deity (Evolved) — Neutral follower, 5/5. アルカナ・光輝.
// Ward.
// On Evolve - Banish a follower from your cemetery: Search your deck for up to 2 followers with the
// banished follower's name, put them into your EX area, then shuffle. (Cards treated as the same card,
// CR 2.13, share the name — ruling.)
import type { CustomCost } from "../types";
import { defineCard, onEvolve } from "../helpers";
import { isFollower, named } from "../targets";

/** "Banish a follower from your cemetery", remembering its name. */
const banishAFollower: CustomCost = {
  canPay: (g, p) => g.cards(p, "cemetery").some((id) => isFollower(g, id)),
  *pay(fx) {
    const followers = fx.game.cards(fx.controller, "cemetery").filter((id) => isFollower(fx.game, id));
    const [card] = yield* fx.chooseCards(followers, 1, 1);
    if (card === undefined) return;
    fx.memory.name = fx.game.info(card).name;
    yield* fx.banish([card]);
  },
};

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      cost: banishAFollower,
      *resolve(fx) {
        const name = fx.memory.name;
        if (typeof name !== "string") return;
        yield* fx.search((id) => isFollower(fx.game, id) && named(name)(fx.game, id), { max: 2, to: "ex" });
      },
    }),
  ],
});
