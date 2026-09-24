// BP02-117 Hamsa — Neutral follower, 3, 0/3.
// {[fanfare]} Reveal the top card of your deck. Give this follower {[attack]}+X. X equals the revealed
// card's cost. (CR 5.21; printed cost, 2.5.1.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(1);
        yield* fx.reveal(top);
        const x = top[0] === undefined ? 0 : (fx.game.info(top[0]).cost ?? 0);
        yield* fx.giveStats(fx.self, x, 0);
      },
    }),
  ],
});
