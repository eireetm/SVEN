// BP15-099 Shiro, Cursed Wings (Evolved) — Havencraft follower, 4/4. 先導・狂信・鳥族.
// Ward.
// On Evolve - Deal each enemy follower on the field damage equal to the number of other followers on your field
// with Ward.
import { defineCard, onEvolve } from "../helpers";
import { wardFollowersOnField } from "./shared-haven";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const self = g.card(fx.self)?.zone === "field" && g.hasKeyword(fx.self, "ward") ? 1 : 0;
        yield* fx.dealDamageEach(g.followers(g.opponent(fx.controller)), wardFollowersOnField(g, fx.controller) - self);
      },
    }),
  ],
});
