// ECP01-037 Hishi Miracle — Abysscraft follower, 2, 2/2. ウマ娘.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Bury the top 2 cards of your deck. If their base costs are the same, draw a card. (Both of them: with fewer than 2
// cards buried there is nothing to compare.)
import { defineCard, evolveAbility, fanfare, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        const buried = yield* fx.mill(2);
        const costs = buried.map((id) => fx.game.info(id).cost);
        if (buried.length === 2 && costs[0] === costs[1]) yield* fx.draw(1);
      },
    }),
  ],
});
