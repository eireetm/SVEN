// BP13-010 Sunbright Elf (Evolved) — Forestcraft follower, 4/4. エルフ族.
// On Evolve - Summon up to 2 Pixie token followers from your EX area.
import { defineCard, onEvolve } from "../helpers";
import { pixieTokenFollower } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const tokens = fx.game.cards(fx.controller, "ex").filter((id) => pixieTokenFollower(fx.game, id));
        yield* fx.putOntoField(yield* fx.chooseCards(tokens, 0, 2));
      },
    }),
  ],
});
