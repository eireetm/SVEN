// BP05-001 Izudia, Omen of Unkilling — Forestcraft follower, 5, 4/4. 絶傑・狩人.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there are at least 3 Hunter cards in your cemetery, select an enemy follower on
// the field. Change it into an amulet and give it "Activate {[cost02]}: Put this card into its
// owner's cemetery." (It keeps all existing abilities, including Evolve and Serve.)
// CR 5.25; rulings: it can't attack, be attacked or take damage, its attack and defense are not
// referenced, follower effects don't select it, it can still evolve (and stays an amulet), its
// Last Words still trigger, and once it leaves the field it is a new card.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { threeHunters } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower({ when: (g, c) => threeHunters(g, c) })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target === undefined) return;
        yield* fx.changeType(target, "amulet");
        yield* fx.grant(target, "activateBury2");
      },
    }),
  ],
});
