// BP21-087 Denan, Big Bad Boss — Abysscraft follower, 2, 2/3. 魔界・学院.
// Whenever you roll a 6-sided die, select a follower on your field. If you roll a 6, give it {[attack]}+1/{[defense]}+1.
// {[act]} {[cost00]}: Roll a 6-sided die. Activate only once per turn.
import { defineCard, whenYouRollADie } from "../helpers";
import { yourFollower } from "../targets";
import { rolled, rollOncePerTurn } from "./shared-abyss";

export default defineCard({
  abilities: [
    whenYouRollADie({
      targets: [yourFollower()],
      *resolve(fx) {
        if (rolled(fx) === 6) yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
    rollOncePerTurn,
  ],
});
