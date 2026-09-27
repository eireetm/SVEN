// ECP01-013 Sirius Symboli [Escorte Étoile] — Swordcraft follower, 2, 2/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Storm. Intimidate.
// {[fanfare]} If there are at least 3 Umamusume cards on your field, give this follower {[defense]}+1 and "Strike - Draw a card,
// then discard a card."
import { defineCard, fanfare, serveAbility } from "../helpers";
import { umamusumeOnYourField } from "./shared";

export default defineCard({
  keywords: ["storm", "intimidate"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field" || umamusumeOnYourField(fx.game, fx.controller) < 3) return;
        yield* fx.giveStats(fx.self, 0, 1);
        yield* fx.grant(fx.self, "strikeDrawDiscard");
      },
    }),
  ],
});
