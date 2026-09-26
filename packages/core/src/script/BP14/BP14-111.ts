// BP14-111 Magna Transformation — Neutral amulet, 1. 宴楽・機械・超克・マグナ.
// {[fanfare]} Search your deck for a Magna Saber, put it into your EX area, then shuffle.
// Whenever a Magna Saber on your field evolves, bury this: Give your leader {[defense]}+1. (CR 10.4.7.4)
import { buryThis } from "../costs";
import { defineCard, fanfare, whenYourFollowerEvolves } from "../helpers";
import { named } from "../targets";

const MAGNA = "Magna Saber";
const leaderUp = whenYourFollowerEvolves({
  cost: buryThis,
  *resolve(fx) {
    yield* fx.giveLeaderDefense(fx.controller, 1);
  },
});

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named(MAGNA)(fx.game, id), { to: "ex" });
      },
    }),
    { ...leaderUp, trigger: (e, me, g) => e.type === "evolved" && named(MAGNA)(g, e.card) && leaderUp.trigger(e, me, g) },
  ],
});
