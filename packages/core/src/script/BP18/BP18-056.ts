// BP18-056 Enchanted Sword — Runecraft spell, 3. 魔法使い.
// This costs 1 less to play for every 5 spells in your cemetery. (10 spells: 2 less — ruling.)
// ----------
// Select a Mage follower on your field and give it {[attack]}+2/{[defense]}+2.
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";
import { mage } from "./shared";

export default defineCard({
  playCost: (g, _self, p) => -Math.floor(g.spellsInCemetery(p) / 5),
  abilities: [
    spell({
      targets: [yourFollower({ filter: mage })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 2, 2);
      },
    }),
  ],
});
