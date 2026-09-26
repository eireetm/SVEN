// BP15-072 Hermit of Disdain — Dragoncraft follower, 1, 0/2. 絶傑・竜族.
// {[fanfare]} Select a follower on your field and, if Overflow is active for you, deal it 1 damage.
// During your turn, whenever this takes ability damage, look at the top card of your deck. If it's an Omen card,
// you may reveal it and add it to your hand. (Otherwise it stays on top, unrevealed — ruling.)
import { defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";
import { omen } from "./shared";
import { whenTakesAbilityDamageOnYourTurn } from "./shared-dragon";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower()],
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
    whenTakesAbilityDamageOnYourTurn({
      *resolve(fx) {
        const top = fx.topCards(1);
        const chosen = yield* fx.selectCards(top.filter((id) => omen(fx.game, id)), 0, 1, fx.controller, top);
        if (chosen.length === 0) return;
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
      },
    }),
  ],
});
