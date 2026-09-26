// BP16-070 Little Dragon Nanny (Evolved) — Dragoncraft follower, 3/3. 竜使い.
// On Evolve - Search your deck for a Dragon's Nest, summon it, then shuffle.
// Once per turn, when a Dragon's Nest is put from your field into the cemetery, summon a Fire Drake Whelp token.
// (Each copy triggers, also during the opponent's turn — rulings.)
import { defineCard, onEvolve, whenYourCardLeaves } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named("Dragon's Nest")(fx.game, id), { to: "field" });
      },
    }),
    whenYourCardLeaves(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.summon(["Fire Drake Whelp"]);
        },
      },
      { filter: (m) => m.to.zone === "cemetery" && m.before?.names.includes("Dragon's Nest") === true },
    ),
  ],
});
