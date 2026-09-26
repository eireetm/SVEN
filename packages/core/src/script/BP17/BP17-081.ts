// BP17-081 Amy, Psychopomp Guide — Abysscraft follower, 1, 1/1. 魔界.
// {[evolve]} {[cost02]}: Evolve this.
// {[fanfare]} Bury another follower: Draw 2 cards. (A follower on your field, CR 10.4.3.)
import { buryAnotherFromYourField } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: buryAnotherFromYourField(isFollower),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
