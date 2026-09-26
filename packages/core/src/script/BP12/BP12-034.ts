// BP12-034 Ivory Sword Dance — Swordcraft spell, 2. 指揮官・プリンセス.
// Select up to 2 enemy followers on the field and deal X damage divided between them. X equals the
// highest attack among followers on your field. (Each selected follower gets at least 1, BP08-028
// ruling, so at most X are selected.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

const highestAttack = (g: GameReader, p: PlayerId): number => Math.max(0, ...g.followers(p).map((id) => g.info(id).attack ?? 0));

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true, max: (g, c) => highestAttack(g, c) })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0]!, highestAttack(fx.game, fx.controller));
      },
    }),
  ],
});
