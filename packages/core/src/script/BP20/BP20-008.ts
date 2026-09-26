// BP20-008 Eradicating Arrow — Forestcraft spell, 2. 絶傑・狩人.
// Select up to 2 enemy followers on the field and deal them 2 damage. If there are at least 6 Hunter cards in your
// cemetery, deal 3 damage instead and deal 2 damage to each enemy leader. (Playable selecting none: then only the leaders
// — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { huntersInCemetery } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        const six = huntersInCemetery(fx.game, fx.controller) >= 6;
        const targets = fx.targets[0] ?? [];
        if (targets.length > 0) yield* fx.dealDamageEach(targets, six ? 3 : 2);
        if (six) yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
