// BP04-042 Europa — Runecraft follower, 2, 1/3. 魔法使い・星神.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Select a faceup Europa in your evolve deck. Turn it facedown and give this follower
// +1/+1. Faceup cards there are public (CR 4.6.3), so this is an ordinary selection: without
// such a card the fanfare cannot be played and nothing happens (ruling).
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      targets: [{ count: 1, candidates: (g, c) => g.faceUpEvolveDeck(c).filter((id) => named("Europa")(g, id)) }],
      *resolve(fx) {
        yield* fx.turnFacedown(fx.targets[0]!);
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
