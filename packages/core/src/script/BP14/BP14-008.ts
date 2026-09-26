// BP14-008 Elven Waitress — Forestcraft follower, 2, 2/2. 宴楽・エルフ族.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a card from your hand on the bottom of your deck: Give your leader {[defense]}+2.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { handCardToDeckBottom } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: handCardToDeckBottom,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
