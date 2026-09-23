// BP01-004 Rhinoceroach — Forestcraft follower, 2, 1/1.
// {[evolve]}{[cost00]}: Evolve this follower. // Rush.
// {[fanfare]} Give this follower +X attack. X equals the number of cards you've played this
// turn, excluding this card. (Only cards you played count, not abilities — rulings; CR 13.2.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    evolveAbility(0),
    fanfare({
      *resolve(fx) {
        const played = fx.event?.type === "cardsMoved" && fx.event.moves.some((m) => m.newCard === fx.self && m.from?.zone === "resolution");
        const x = fx.game.playedThisTurn(fx.controller) - (played ? 1 : 0);
        yield* fx.giveStats(fx.self, x, 0);
      },
    }),
  ],
});
