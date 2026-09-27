// CP04-078 Shinobu (Evolved) — Abysscraft, 4/4. プリコネ・ディアボロス.
// On Evolve - Summon a Skullfather token.
// Whenever a {[ub]} ability of another follower on your field is executed, bury the top card of your deck.
import { defineCard, onEvolve, whenAnotherFollowersUnionBurst } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Skullfather"]);
      },
    }),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
