// BP11-037 Maiser, Neighborhood Hero — Runecraft follower, 2, 1/1. 荒野・魔法使い.
// {[fanfare]} Summon a Dutiful Steed token. Search your deck for a Rapid Fire, put it into your EX area,
// then shuffle. Spellchain (5) - It costs 1 less to play this turn.
// Once on each of your turns, when you play a spell that originally costs 1 or less, draw a card, then
// discard a card. (Playing an ability is not playing a spell; each Maiser once — rulings.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { and, costAtMost, isSpell, named } from "../targets";
import { STEED, yourTurn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([STEED]);
        const found = yield* fx.search((id) => named("Rapid Fire")(fx.game, id), { to: "ex" });
        if (fx.game.spellchain(fx.controller, 5)) for (const card of found) yield* fx.changePlayCost(card, -1, "endOfTurn");
      },
    }),
    whenYouPlay(
      {
        oncePerTurn: true,
        triggerIf: yourTurn,
        *resolve(fx) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
        },
      },
      and(isSpell, costAtMost(1)),
    ),
  ],
});
