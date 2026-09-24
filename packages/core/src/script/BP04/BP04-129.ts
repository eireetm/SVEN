// BP04-129 Mr. Full Moon — Neutral follower, 5, 3/3. 光輝・星神.
// {[fanfare]}/{[lastwords]} Select an enemy follower on the field and give it -3/-3. (Attack can go
// below 0 — ruling.)
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

const weaken = {
  targets: [enemyFollower()],
  *resolve(fx: import("../../engine/effects/context").EffectContext) {
    yield* fx.giveStats(fx.targets[0]![0]!, -3, -3);
  },
};

export default defineCard({ abilities: [fanfare(weaken), lastWords(weaken)] });
