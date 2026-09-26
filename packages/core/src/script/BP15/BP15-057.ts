// BP15-057 Galmieux, Ardent Disdain — Dragoncraft follower, 5, 5/5. 絶傑・竜族.
// {[fanfare]} Put a Fangs of Ardent Destruction token into your EX area.
// During your turn, whenever this takes ability damage, look at the top 2 cards of your deck. You may put one of
// them into your EX area. If it's an Omen card, it costs 3 less to play this turn. Bury the rest.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { omen } from "./shared";
import { whenTakesAbilityDamageOnYourTurn } from "./shared-dragon";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fangs of Ardent Destruction"]);
      },
    }),
    whenTakesAbilityDamageOnYourTurn({
      *resolve(fx) {
        for (const id of yield* lookAtTopCards(fx, 2, { filter: () => true, to: "ex", rest: "cemetery" })) {
          if (omen(fx.game, id)) yield* fx.changePlayCost(id, -3, "endOfTurn");
        }
      },
    }),
  ],
});
