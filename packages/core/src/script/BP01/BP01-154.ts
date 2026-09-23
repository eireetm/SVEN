// BP01-154 Flame and Glass — Neutral follower, 10, 7/7.
// Storm. // Strike: Deal 3 damage to each enemy follower on the field. If there is a Harnessed
// Flame and Harnessed Glass in your cemetery, deal 7 damage instead.
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      *resolve(fx) {
        const names = fx.game.cards(fx.controller, "cemetery").map((id) => fx.game.info(id).name);
        const both = names.includes("Harnessed Flame") && names.includes("Harnessed Glass");
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), both ? 7 : 3);
      },
    }),
  ],
});
