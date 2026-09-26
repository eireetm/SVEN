// BP21-056 Lilium, the Wyrmwitch (Evolved) — 3/3. (Printed "Lilium, the Witchwyrm", data/fixes.ts.)
// At the start of your end phase, if there are at least 3 Academic followers on your field, summon a Lilium's Hatchling token.
// On Evolve - Search your deck for an Academic follower not named Lilium, the Wyrmwitch, reveal it, add it to your hand,
// then shuffle.
// On Super-Evolve - Summon a Lilium's Dragon token.
import { atStartOfYourEndPhase, defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { named } from "../targets";
import { academicFollower } from "./shared";

const lilium = named("Lilium, the Wyrmwitch");

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.followers(fx.controller).filter((id) => academicFollower(fx.game, id)).length >= 3) yield* fx.summon(["Lilium's Hatchling"]);
      },
    }),
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => academicFollower(fx.game, id) && !lilium(fx.game, id), { to: "hand" });
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.summon(["Lilium's Dragon"]);
      },
    }),
  ],
});
