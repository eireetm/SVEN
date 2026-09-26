// BP10-111 Starbright Deity — Neutral follower, 3, 3/3. アルカナ・光輝.
// {[evolve]} {[cost03]}: Evolve this follower
// Ward.
// {[fanfare]} Reveal a follower from your hand: Search your deck for a follower with the revealed
// follower's name, put it into your EX area, then shuffle. (Cards treated as the same card, CR 2.13,
// share the name — ruling.)
import type { CustomCost } from "../types";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isFollower, named } from "../targets";

/** "Reveal a follower from your hand", remembering its name. */
const revealAFollower: CustomCost = {
  canPay: (g, p) => g.cards(p, "hand").some((id) => isFollower(g, id)),
  *pay(fx) {
    const followers = fx.game.cards(fx.controller, "hand").filter((id) => isFollower(fx.game, id));
    const [card] = yield* fx.chooseCards(followers, 1, 1);
    if (card === undefined) return;
    yield* fx.reveal([card]);
    fx.memory.name = fx.game.info(card).name;
  },
};

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(3),
    fanfare({
      cost: revealAFollower,
      *resolve(fx) {
        const name = fx.memory.name;
        if (typeof name !== "string") return;
        yield* fx.search((id) => isFollower(fx.game, id) && named(name)(fx.game, id), { to: "ex" });
      },
    }),
  ],
});
