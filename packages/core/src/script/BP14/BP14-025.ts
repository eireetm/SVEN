// BP14-025 Hero of the Hunt — Swordcraft spell, 3. 宴楽・指揮官.
// Select an enemy follower on the field. Deal it 5 damage, put a Glittering Gold token into your EX area,
// and, if there are at least 5 Festive cards or at least 10 {[swordcraft]} cards in your cemetery, search your
// deck for a Taketsumi, Aconite Paladin, summon it, then shuffle. (With a full EX area no token — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";
import { GLITTERING_GOLD, paradiseReady } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.tokensToEx([GLITTERING_GOLD]);
        if (!paradiseReady("Swordcraft")(fx.game, fx.controller)) return;
        yield* fx.search((id) => named("Taketsumi, Aconite Paladin")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
