// BP05-112 Enlightenment — Neutral spell, 1. 絶傑.
// Select a follower on your field and give it {[attack]}+1/{[defense]}+1. If it's a Mjerrabaine,
// Omen of One, give {[attack]}+3/{[defense]}+3 and Assail instead, and for the rest of this turn,
// it has "This follower doesn't take damage."
import { defineCard, spell } from "../helpers";
import { named, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target)?.zone !== "field") return;
        if (!named("Mjerrabaine, Omen of One")(fx.game, target)) {
          yield* fx.giveStats(target, 1, 1);
          return;
        }
        yield* fx.giveStats(target, 3, 3);
        yield* fx.giveKeyword(target, "assail");
        yield* fx.preventDamage(target, "all", "endOfTurn");
      },
    }),
  ],
});
