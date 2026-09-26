// BP16-096 Rana, Dual Cannon Abbess — Havencraft follower, 6, 3/3. 荒野・信仰.
// {[fanfare]} Search your deck for up to 2 Wasteland cards not named Rana, Dual Cannon Abbess that cost a total of 6 or
// less, put them into your EX area, then shuffle. They cost 0 to play this turn. Summon a Bullet Bike token. (元のコスト.)
// {[act]} {[cost00]}: Deal 1 damage to each enemy follower on the field. Activate only once per turn.
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { wasteland } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const found = yield* fx.search((id) => wasteland(g, id) && !named("Rana, Dual Cannon Abbess")(g, id), {
          max: 2,
          totalCostAtMost: 6,
          to: "ex",
        });
        for (const id of found) yield* fx.setPlayCost(id, 0, "endOfTurn");
        yield* fx.summon(["Bullet Bike"]);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
        },
      },
    ),
  ],
});
