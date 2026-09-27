// CP04-038 Karyl (Evolved) — Runecraft, 4/5. プリコネ・美食殿.
// On Evolve - Select an enemy follower on the field and deal it 5 damage.
// On Super-Evolve - Select up to 2 spells in your cemetery with different names and put them into your EX area. They cost 2 less
// to play this turn.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower, inYourZone, isSpell } from "../targets";
import { cheaperThisTurn } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
    onSuperEvolve({
      targets: [inYourZone("cemetery", { filter: isSpell, count: 2, upTo: true, distinctNames: true })],
      *resolve(fx) {
        yield* cheaperThisTurn(fx, yield* fx.putIntoEx(fx.targets[0]!), 2);
      },
    }),
  ],
});
