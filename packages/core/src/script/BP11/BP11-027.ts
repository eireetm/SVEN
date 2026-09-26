// BP11-027 Outlaw Gunner — Swordcraft follower, 2, 2/2. 荒野・兵士・盗賊.
// {[fanfare]} Summon a Bullet Bike token.
// {[lastwords]} Deal 2 damage to each enemy leader.
import { defineCard, fanfare, lastWords } from "../helpers";
import { BIKE } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([BIKE]);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
