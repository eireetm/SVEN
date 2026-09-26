// BP17-042 Tetra, Serene Sapphire (Evolved) — Runecraft follower, 3/3. 機械・ゴーレム.
// On Evolve - Look at the top 4 cards of your deck. From among them, you may reveal up to 1 Machina card and up to 1 Delta
// Cannon and add them to your hand. Put the rest on the bottom of your deck in any order. (Just one of them is fine —
// ruling.)
// On Super-Evolve - Give this "Whenever you play a Machina card, deal 1 damage to each enemy leader and enemy follower on
// the field" for the rest of this turn.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { named } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const top = fx.topCards(4);
        const machinaCard = yield* fx.selectCards(top.filter((id) => machina(g, id)), 0, 1, fx.controller, top);
        const cannon = yield* fx.selectCards(
          top.filter((id) => !machinaCard.includes(id) && named("Delta Cannon")(g, id)),
          0,
          1,
          fx.controller,
          top,
        );
        const chosen = [...machinaCard, ...cannon];
        if (chosen.length > 0) {
          yield* fx.reveal(chosen);
          yield* fx.returnToHand(chosen);
        }
        yield* fx.bottomInAnyOrder(top.filter((id) => g.card(id)?.zone === "deck"));
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.grant(fx.self, "machinaPlayPing", "endOfTurn");
      },
    }),
  ],
});
