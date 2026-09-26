// BP21-083 Demon-Eyed Gangster — Abysscraft follower, 1, 2/2. 魔界・学院.
// Whenever you roll a 6-sided die, if you roll a 6, deal 2 damage to each enemy leader.
// {[act]} {[cost00]}: Roll a 6-sided die. Activate only once per turn.
import { defineCard, whenYouRollADie } from "../helpers";
import { rolled, rollOncePerTurn } from "./shared-abyss";

export default defineCard({
  abilities: [
    whenYouRollADie({
      *resolve(fx) {
        if (rolled(fx) === 6) yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 2);
      },
    }),
    rollOncePerTurn,
  ],
});
