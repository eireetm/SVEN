// BP16-014 Fairy Tamer (Evolved) — Forestcraft follower, 2/2. 妖精・エルフ族.
// On Evolve - Select up to 2 other Pixie followers on your field and/or in your EX area and give them
// {[attack]}+1/{[defense]}+1. (Any mix of the two — ruling.)
import type { TargetSpec } from "../types";
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";
import { pixie } from "./shared";

const otherPixies: TargetSpec = {
  candidates: (g, c, self) => [...g.cards(c, "field"), ...g.cards(c, "ex")].filter((id) => id !== self && isFollower(g, id) && pixie(g, id)),
  count: 2,
  upTo: true,
};

export default defineCard({
  abilities: [
    onEvolve({
      targets: [otherPixies],
      *resolve(fx) {
        for (const id of fx.targets[0] ?? []) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
