// CP04-T04 Queen's Console — Swordcraft equipment token, 2. プリコネ・ラビリンス・七冠.
// The equipped follower has "{[ub]} Activate {[cost01]}, engage this: Give each 1-cost follower on your field {[attack]}+1."
// (Place this beneath the equipped follower.) (元のコスト. The follower's own ability, so CP04-114 can execute it — ruling.)
import { activated, defineCard, ub } from "../helpers";
import { costs } from "./shared";

export default defineCard({
  equipment: {
    abilities: [
      ub(
        activated(
          { playPoints: 1, engageSelf: true },
          {
            *resolve(fx) {
              for (const id of fx.game.followers(fx.controller).filter((f) => costs(1)(fx.game, f))) yield* fx.giveStats(id, 1, 0);
            },
          },
        ),
      ),
    ],
  },
});
