// BP09-079 Blood Moon — Abysscraft amulet, 2. 獣.
// {[fanfare]} Search your deck for a Beast follower, reveal it, add it to your hand, then shuffle your
// deck.
// {[act]} {[engage]}, bury this card: Deal 1 damage to each leader.
import { activated, defineCard, fanfare } from "../helpers";
import { beastFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => beastFollower(fx.game, id));
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.dealDamageEach([fx.game.leader(fx.controller), fx.game.leader(fx.game.opponent(fx.controller))], 1);
        },
      },
    ),
  ],
});
