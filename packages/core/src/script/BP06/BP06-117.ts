// BP06-117 Biofabrication — Neutral spell, 1. 超克.
// Select a faceup evolved follower in your evolve deck. Turn it facedown and draw a card. (Not
// playable without one — ruling: faceup cards are public, so this is an ordinary "select".)
import { defineCard, spell } from "../helpers";
import { faceUpEvolvedFollowers } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [{ count: 1, candidates: (g, c) => faceUpEvolvedFollowers(g, c) }],
      *resolve(fx) {
        yield* fx.turnFacedown(fx.targets[0] ?? []);
        yield* fx.draw(1);
      },
    }),
  ],
});
