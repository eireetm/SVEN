// BP02-111 Archangel Reina (Evolved) — 5/6.
// Ward.
// On Evolve: Recover X play points. X equals the number of faceup followers in your evolve deck.
// Turn them facedown. (CR 4.6.3, 5.15; facedown again, they can be used to evolve — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const faceUp = fx.game.faceUpEvolveDeck(fx.controller).filter((id) => isFollower(fx.game, id));
        yield* fx.recoverPlayPoints(faceUp.length);
        yield* fx.turnFacedown(faceUp);
      },
    }),
  ],
});
