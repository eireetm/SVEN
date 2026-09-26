// BP13-026 Lounes, Levin Apprentice — Swordcraft follower, 1, 1/1. 兵士・レヴィオン.
// {[evolve]} {[cost03]}: Evolve this follower.
// {[fanfare]} Discard a Levin card: Search your deck for a {[swordcraft]} follower with "Albert" in its
// name, reveal it, add it to your hand, then shuffle.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { discardA } from "../costs";
import { levin } from "./shared";
import { albertFollower } from "./shared-sword";

export default defineCard({
  abilities: [
    evolveAbility(3),
    fanfare({
      cost: discardA(levin),
      *resolve(fx) {
        yield* fx.search((id) => albertFollower(fx.game, id));
      },
    }),
  ],
});
