// BP14-059 Soothing Dragonspring — Dragoncraft amulet, 3. 宴楽・竜族.
// {[fanfare]} Place 10 divine water counters on this.
// Once on each of your turns, when a Festive follower is put onto your field, give your leader {[defense]}+1.
// At the start of your end phase, remove a divine water counter from this. Then, if this has no divine water
// counters, bury it and deal 5 damage to each enemy follower on the field.
import { atStartOfYourEndPhase, defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { DIVINE_WATER, festive, yourTurn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, DIVINE_WATER, 10);
      },
    }),
    whenFollowerEntersYourField(
      {
        triggerIf: yourTurn,
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { filter: festive },
    ),
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.removeCounters(fx.self, DIVINE_WATER, 1);
        if (fx.game.counters(fx.self, DIVINE_WATER) > 0) return;
        yield* fx.bury([fx.self]);
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 5);
      },
    }),
  ],
});
