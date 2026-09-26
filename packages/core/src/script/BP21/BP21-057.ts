// BP21-057 Coach Joe, Fiery Counselor — Dragoncraft follower, 5, 5/5. ドラゴニュート・学院.
// Whenever an Academic follower is put onto your field, if this in your EX area, place a passion counter on it. (Valid in
// the EX area; once per follower — rulings, CR 10.3.5.)
// Activate {[engage]} this: If this or a card in your EX area has at least 10 passion counters, deal 5 damage to each enemy
// leader and enemy follower on the field. Give this {[defense]}+6. (Q10: the {[defense]}+6 is under the condition too. The
// counters stay on it when it is played from the EX area — ruling, CR 4.8.3.3.)
// {[act]} {[cost00]}: Put this from your hand into your EX area. (Valid in the hand — ruling. Paid as the cost: nothing
// happens between paying and resolving, and it is not offered with a full EX area, CR 4.8.3.2.)
import { putThisFromHandIntoEx } from "../costs";
import { activated, defineCard, whenFollowerEntersYourField } from "../helpers";
import { academic, PASSION, passionInEx } from "./shared";

export default defineCard({
  abilities: [
    {
      ...whenFollowerEntersYourField(
        {
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "ex") yield* fx.addCounters(fx.self, PASSION, 1);
          },
        },
        { filter: academic },
      ),
      validIn: ["ex"],
    },
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          const g = fx.game;
          if (Math.max(g.counters(fx.self, PASSION), passionInEx(g, fx.controller)) < 10) return;
          const opponent = g.opponent(fx.controller);
          yield* fx.dealDamageEach([g.leader(opponent), ...g.followers(opponent)], 5);
          if (g.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 0, 6);
        },
      },
    ),
    activated({ custom: putThisFromHandIntoEx }, { validIn: ["hand"] }),
  ],
});
