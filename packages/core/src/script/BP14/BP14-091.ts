// BP14-091 Nekhbet — Havencraft follower, 3, 2/2. 信仰・鳥族.
// This can't be played from the EX area.
// ----------
// {[evolve]} {[cost01]}: Evolve this.
// At the start of each opponent's end phase, if this is in your EX area, {[cost02]}: Deal 2 damage to each enemy
// leader. Give your leader {[defense]}+2. (Valid in the EX area; each copy triggers; it resolves before the quick
// timing — rulings.)
import { playPointsCost } from "../costs";
import { atStartOfOpponentsEndPhase, defineCard, evolveAbility } from "../helpers";

export default defineCard({
  playableIf: (g, self) => g.playZone(self) !== "ex",
  abilities: [
    evolveAbility(1),
    {
      ...atStartOfOpponentsEndPhase({
        cost: playPointsCost(2),
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      }),
      validIn: ["ex"],
    },
  ],
});
