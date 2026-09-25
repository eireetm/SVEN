// BP06-109 Badb Catha (Evolved) — Neutral follower, 4/5. 大神・光輝.
// On Evolve - Choose one of the following. (1) {[engage]} each enemy follower on the field. (2) Deal
// 2 damage to each enemy leader. (3) Put the top card of your deck into your EX area.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "engage",
          label: "Engage each enemy follower",
          *resolve(fx) {
            yield* fx.engage(fx.game.followers(fx.game.opponent(fx.controller)));
          },
        },
        {
          id: "damage",
          label: "Deal 2 damage to each enemy leader",
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
          },
        },
        {
          id: "ex",
          label: "Put the top card of your deck into your EX area",
          *resolve(fx) {
            yield* fx.topToEx(1);
          },
        },
      ],
    }),
  ],
});
