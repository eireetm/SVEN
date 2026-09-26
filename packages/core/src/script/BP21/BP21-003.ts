// BP21-003 Lyelth, Immaculate Idol (Evolved) — 2/4.
// On Evolve - Put a Lyelth's Marionette token into your EX area.
// On Super-Evolve - Select a Puppetry token follower in your EX area and, if there are at least 3 Puppetry cards in your
// cemetery, give it {[attack]}+4/{[defense]}+4. (It keeps them when played from there, CR 10.6.2.1.3.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { and, inYourZone, isFollower, isToken } from "../targets";
import { puppetry } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Lyelth's Marionette"]);
      },
    }),
    onSuperEvolve({
      targets: [inYourZone("ex", { filter: and(isFollower, isToken, puppetry) })],
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "cemetery").filter((id) => puppetry(fx.game, id)).length >= 3) {
          yield* fx.giveStats(fx.targets[0]![0]!, 4, 4);
        }
      },
    }),
  ],
});
