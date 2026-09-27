// CP04-103 Mimi — Havencraft follower, 2, 2/2. プリコネ・リトルリリカル.
// {[evolve]} {[cost02]}: Evolve this.
// {[fanfare]} Search your deck for a Prank Proclamation, reveal it, add it to your hand, then shuffle.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named("Prank Proclamation")(fx.game, id));
      },
    }),
  ],
});
