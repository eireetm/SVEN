// BP20-T05 Crest: Galmieux, Ardor Manifest — Dragoncraft crest token. 絶傑・竜族.
// {[act]} {[cost00]}: Select an Omen follower on your field and deal it 1 damage. Activate only once per turn. (Valid in the EX
// area, CR 10.3.6.)
import { activated, defineCard } from "../helpers";
import { yourFollower } from "../targets";
import { omen } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        targets: [yourFollower({ filter: omen })],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
