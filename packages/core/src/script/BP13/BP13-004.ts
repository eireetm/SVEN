// BP13-004 Aria, Miasma Fairy (Evolved) — Forestcraft follower, 4/4. 妖精・プリンセス・キラー.
// Each Pixie token follower on your field has Rush.
// On Evolve - Search your deck for a Pixie amulet that costs 2 or less, summon it, then shuffle.
// {[lastwords]} You may put this card into its owner's EX area. (This card is then the base card in the
// cemetery, CR 4.1.4.1.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, isAmulet } from "../targets";
import { mayGoToExLastWords, pixie, pixieTokensHaveRush } from "./shared";

const cheapPixieAmulet = and(isAmulet, pixie, costAtMost(2));

export default defineCard({
  field: { keywordsFor: pixieTokensHaveRush },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => cheapPixieAmulet(fx.game, id), { to: "field" });
      },
    }),
    mayGoToExLastWords,
  ],
});
