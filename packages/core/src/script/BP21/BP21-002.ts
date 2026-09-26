// BP21-002 Lyelth, Immaculate Idol — Forestcraft follower, 2, 1/3. 人形・学院.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard a Puppetry card: Draw 2 cards. (CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { puppetry } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: discardA(puppetry),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
