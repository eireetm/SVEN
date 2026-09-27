// ECP01-009 A MORE MARVELOUS WORLD! ☆ — Forestcraft amulet, 1. ウマ娘.
// {[fanfare]} Look at the top card of your deck. If it's an Umamusume card, you may reveal it and add it to your hand. (Not
// taken, it stays on top, unrevealed — ruling.)
// {[act]} {[cost02]}, {[engage]}, bury this card: Give your leader {[defense]}+2.
import { activated, defineCard, fanfare } from "../helpers";
import { mayTakeTopCard, umamusume } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* mayTakeTopCard(fx, umamusume);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
    ),
  ],
});
