// BP11-012 Lookout Elf — Forestcraft follower, 3, 3/3. エルフ族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Look at the top card of your deck. You may put it on the bottom of your deck. Put 2 Fairy
// tokens into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const [top] = fx.topCards(1);
        if (top !== undefined) {
          yield* fx.lookAt([top]);
          if (yield* fx.confirm()) yield* fx.putOnDeck([top], "bottom");
        }
        yield* fx.tokensToEx(["Fairy", "Fairy"]);
      },
    }),
  ],
});
