// BP10-081 Sincere Soul — Abysscraft spell, 4. 死者.
// {[act]} {[cost04]}, banish this card from your cemetery: If there's a Masquerade Ghost in your EX
// area, you may summon a Sincere Masquerade Ghost from your evolve deck. (Valid in the cemetery —
// ruling, CR 10.3.5. An advanced card, CR 9.2.)
// ----------
// Search your deck for a Masquerade Ghost, summon it, then shuffle. Give it Ward.
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { named } from "../targets";

const masqueradeGhost = named("Masquerade Ghost");

export default defineCard({
  abilities: [
    activated(
      { playPoints: 4, custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        *resolve(fx) {
          if (!fx.game.cards(fx.controller, "ex").some((id) => masqueradeGhost(fx.game, id))) return;
          yield* fx.fromEvolveDeck((id) => named("Sincere Masquerade Ghost")(fx.game, id), { to: "field" });
        },
      },
    ),
    spell({
      *resolve(fx) {
        for (const ghost of yield* fx.search((id) => masqueradeGhost(fx.game, id), { to: "field" })) {
          yield* fx.giveKeyword(ghost, "ward");
        }
      },
    }),
  ],
});
