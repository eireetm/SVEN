// CP04-049 Yuki — Runecraft follower, 3, 3/3. プリコネ・ヴァイスフリューゲル.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Search your deck for a spell, reveal it, add it to your hand, then shuffle.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isSpell(fx.game, id));
      },
    }),
  ],
});
