// BP18-T01 Seeds of Salvation — Forestcraft spell token, 1. 透京・植物族.
// Draw a card. You may turn any number of faceup evolved followers in your evolve deck facedown. Gain 1 Evolution Point.
// (Not Drive Points or advanced cards; even at 3 evolution points — rulings; CR 4.6.3.)
import { defineCard, spell } from "../helpers";
import { isEvolvedFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
        const faceUp = fx.game.faceUpEvolveDeck(fx.controller).filter((id) => isEvolvedFollower(fx.game, id));
        if (faceUp.length > 0) yield* fx.turnFacedown(yield* fx.chooseCards(faceUp, 0, faceUp.length));
        yield* fx.gainEvolutionPoints(1);
      },
    }),
  ],
});
