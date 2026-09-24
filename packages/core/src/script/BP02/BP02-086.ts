// BP02-086 Demonic Hedonist (Evolved) — 3/3.
// Strike: Deal 1 damage to each leader (yours too — ruling).
// At the start of your end phase, if Sanguine is active for you, draw a card, then discard a card.
import { defineCard, strike } from "../helpers";
import { sanguineCycle } from "./shared";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.game.leader(fx.controller), fx.game.leader(fx.game.opponent(fx.controller))], 1);
      },
    }),
    sanguineCycle,
  ],
});
