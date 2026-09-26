// BP20-024 Congregant of Usurpation (Evolved) — 5/5.
// Whenever an enemy follower on the field is put into the cemetery, put a Gilded Blade, Gilded Goblet or Gilded Boots token
// into your EX area. (On the opponent's turn too — ruling.)
// On Evolve - Select an enemy follower on the field and deal it 5 damage. The next Loot card you play this turn costs 2
// less. (Without a target, not played at all — ruling.)
import { defineCard, onEvolve, whenEnemyFollowerToCemetery } from "../helpers";
import { enemyFollower } from "../targets";
import { GILDED_BLADE, GILDED_BOOTS, GILDED_GOBLET, loot } from "./shared";

export default defineCard({
  nextPlay: { loot: (g, card) => loot(g, card) },
  abilities: [
    whenEnemyFollowerToCemetery({
      *resolve(fx) {
        const [pick] = yield* fx.choose([
          { id: GILDED_BLADE, label: GILDED_BLADE },
          { id: GILDED_GOBLET, label: GILDED_GOBLET },
          { id: GILDED_BOOTS, label: GILDED_BOOTS },
        ]);
        yield* fx.tokensToEx([pick ?? GILDED_BLADE]);
      },
    }),
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.nextPlayCostsLess("loot", 2);
      },
    }),
  ],
});
