// BP20-064 Supplicant of Disdain — Dragoncraft follower, 2, 2/2. 絶傑・竜族.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Select a follower on the field. If Overflow is active for you, deal it 1 damage and give your leader
// {[defense]}+2. (This one or another of yours too — ruling; both under the condition, Q10.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { anyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [anyFollower()],
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) return;
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
