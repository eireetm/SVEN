// BP08-090 Eidolon of Madness (Evolved) — Havencraft evolved amulet. 狂信・偶像.
// On Evolve: banish an enemy follower. Last Words: deal 3 to each enemy leader. It has no attack or
// defense and is affected as an amulet (rulings; CR 2.3.3, 5.7, 5.16, 12.5).
import { defineCard, lastWords, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({ targets: [enemyFollower()], *resolve(fx) { yield* fx.banish(fx.targets[0] ?? []); } }),
    lastWords({ *resolve(fx) { yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3); } }),
  ],
});
