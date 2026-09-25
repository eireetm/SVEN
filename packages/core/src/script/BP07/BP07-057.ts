// BP07-057 Marion, Elegant Dragonewt (Evolved) — 2/2.
// On Evolve - Select another {[dragoncraft]} follower on your field or in your EX area and give it
// {[attack]}+1/{[defense]}+1. (A card in the EX area keeps it when put onto the field, CR 4.8.3.3.)
import { defineCard, onEvolve } from "../helpers";
import { and, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [
        {
          count: 1,
          candidates: (g, c, self) =>
            [...g.cards(c, "field"), ...g.cards(c, "ex")].filter((id) => id !== self && and(isFollower, isClass("Dragoncraft"))(g, id)),
        },
      ],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target)) yield* fx.giveStats(target, 1, 1);
      },
    }),
  ],
});
