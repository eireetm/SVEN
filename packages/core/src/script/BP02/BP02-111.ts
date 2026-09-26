// BP02-111 Archangel Reina (Evolved) — 5/6.
// Ward.
// On Evolve: Recover X play points. X equals the number of faceup followers in your evolve deck.
// Turn them facedown. (CR 4.6.3, 5.15; facedown again, they can be used to evolve — ruling. The
// Japanese text says evolved followers: not advanced followers, CR 9.2.)
import { defineCard, onEvolve } from "../helpers";
import { isEvolvedFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const faceUp = fx.game.faceUpEvolveDeck(fx.controller).filter((id) => isEvolvedFollower(fx.game, id));
        yield* fx.recoverPlayPoints(faceUp.length);
        yield* fx.turnFacedown(faceUp);
      },
    }),
  ],
});
