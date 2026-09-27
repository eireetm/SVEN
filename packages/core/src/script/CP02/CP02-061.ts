// CP02-061 Yuka Nakano (Evolved) — 2/3.
// On Evolve - Deal 1 damage to each enemy follower on the field. If you have 10 max play points, deal 4 damage instead.
import { defineCard, onEvolve } from "../helpers";
import { maxPlayPointsTen } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.dealDamageEach(g.followers(g.opponent(fx.controller)), maxPlayPointsTen(g, fx.controller) ? 4 : 1);
      },
    }),
  ],
});
