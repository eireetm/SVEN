// BP21-065 Gunbein, Lofty Dragonewt — Dragoncraft follower, 3, 3/3. ドラゴニュート・学院.
// Ward.
// {[fanfare]} {[cost02]} Search your deck for a Gunbein, Lofty Dragonewt, summon it, then shuffle. (CR 10.4.7.4.)
// Activate {[engage]} this: Select an enemy follower on the field. If there's a card in your EX area with at least 4 passion
// counters, deal it 4 damage. If it has at least 10, give this {[defense]}+6. (Needs a target — ruling.)
import { playPointsCost } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";
import { passionInEx } from "./shared";
import { tenPassionDefense } from "./shared-dragon";

const gunbein = named("Gunbein, Lofty Dragonewt");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.search((id) => gunbein(fx.game, id), { to: "field" });
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          if (passionInEx(fx.game, fx.controller) >= 4) yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          yield* tenPassionDefense(fx);
        },
      },
    ),
  ],
});
