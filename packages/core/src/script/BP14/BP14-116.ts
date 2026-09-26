// BP14-116 Brave Goblin — Neutral follower, 2, 2/2. ゴブリン.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} {[cost02]}, discard a Goblinoid card: Select an enemy follower on the field. Deal it 4 damage and
// give this {[attack]}+2/{[defense]}+2. (Not played without a target — ruling.)
import { allCosts, discardA, playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { goblin } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: allCosts(playPointsCost(2), discardA(goblin)),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
