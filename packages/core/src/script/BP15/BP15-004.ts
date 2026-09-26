// BP15-004 Piercye, Queen of Frost — Forestcraft follower, 4, 3/3. エルフ族.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there are at least 3 faceup evolved followers in your evolve deck, evolve this. (Not advanced
// followers or evolved amulets — rulings.)
// Whenever a follower on your field evolves, deal 1 damage to each enemy leader and 2 damage to each enemy
// follower on the field, and give your leader {[defense]}+1.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isEvolvedFollower } from "../targets";
import { piercyeFrost } from "./shared-forest";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => g.faceUpEvolveDeck(p).filter((id) => isEvolvedFollower(g, id)).length >= 3,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
    piercyeFrost,
  ],
});
