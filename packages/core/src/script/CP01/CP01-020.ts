// CP01-020 Hishi Amazon — Swordcraft follower, 3, 4/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Rush.
// {[fanfare]} {[cost03]} Search your deck for an Umamusume follower that costs 3 play points and put it onto your field.
// (CR 10.4.7.4.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare, serveAbility } from "../helpers";
import { umamusumeFollower } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: playPointsCost(3),
      *resolve(fx) {
        yield* fx.search((id) => umamusumeFollower(fx.game, id) && fx.game.info(id).cost === 3, { to: "field" });
      },
    }),
  ],
});
