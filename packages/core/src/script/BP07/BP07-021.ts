// BP07-021 Tsubaki of the Demon Blade — Swordcraft follower, 3, 4/3. 暗殺者・忍者.
// {[fanfare]} If there are at least 5 {[swordcraft]} followers in your cemetery, select an enemy
// follower on the field and destroy it.
// While there are at least 10 {[swordcraft]} followers in your cemetery, this follower has Storm.
// (A passive ability: it gains and loses Storm as the count changes — ruling.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

/** Swordcraft followers in the player's cemetery (printed information: only game.card / db). */
const swordcraftFollowers = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "cemetery").filter((id) => {
    const d = g.db.get(g.card(id)!.def);
    return d.type === "follower" && d.class === "Swordcraft";
  }).length;

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => (card === self && swordcraftFollowers(g, g.card(self)!.controller) >= 10 ? ["storm"] : []),
  },
  abilities: [
    fanfare({
      targets: [enemyFollower({ when: (g, c) => swordcraftFollowers(g, c) >= 5 })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
  ],
});
