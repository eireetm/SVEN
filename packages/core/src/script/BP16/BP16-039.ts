// BP16-039 Lilanthim, Anathema of Edacity (Evolved) — Runecraft follower, 5/5. アナテマ・魔法使い.
// On Super-Evolve - Select up to 2 enemy followers on the field and destroy them. Add 2 to a Stack on your field.
// (With no enemy follower it still adds 2 — ruling; with no Stack card, a Magic Sediment with 2 Stack counters is
// summoned — ruling, rules change of 2026-07-31.)
// Activate - Earth Rite: Give this Assail.
// {[lastwords]} - Earth Rite: Put this onto its owner's field engaged.
import { activated, defineCard, lastWords, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { edacityAssail } from "./shared-rune";

export default defineCard({
  abilities: [
    onSuperEvolve({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
        yield* fx.addToStack(2);
      },
    }),
    activated({}, edacityAssail),
    lastWords({
      earthRite: { mode: "required" },
      *resolve(fx) {
        const c = fx.game.card(fx.self);
        if (c?.zone === "cemetery") yield* fx.putOntoField([fx.self], c.owner, { engaged: true });
      },
    }),
  ],
});
