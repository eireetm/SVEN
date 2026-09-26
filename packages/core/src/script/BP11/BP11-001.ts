// BP11-001 Loxis, Homestead Pioneer — Forestcraft follower, 4, 4/4. 荒野・エルフ族・狩人.
// {[evolve]} {[cost01]}: Evolve this follower.
// 3 times on each of your turns, when you play an amulet, recover 1 play point. (Each Loxis counts
// its own 3 — ruling, CR 10.7.2.2.)
// Activate {[engage]} 3 amulets on your field: Draw a card. (Also more than once a turn — ruling.)
import { engageYourCards } from "../costs";
import { activated, defineCard, evolveAbility, whenYouPlay } from "../helpers";
import { isAmulet } from "../targets";
import { yourTurn } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    whenYouPlay(
      {
        timesPerTurn: 3,
        triggerIf: yourTurn,
        *resolve(fx) {
          yield* fx.recoverPlayPoints(1);
        },
      },
      isAmulet,
    ),
    activated(
      { custom: engageYourCards(isAmulet, 3) },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
