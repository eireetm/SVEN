// BP13-003 Aria, Miasma Fairy — Forestcraft follower, 3, 3/3. 妖精・プリンセス・キラー.
// This card can't be played from the EX area.
// ----------
// {[evolve]} {[cost01]}: Evolve this follower.
// While this card is on your field or in your EX area, each Pixie token follower on your field has Rush.
// (A passive, CR 10.3.5 "unless indicated otherwise"; an attack already declared goes on without it —
// ruling.)
// {[fanfare]} Put a Fairy token into your EX area.
// {[lastwords]} You may put this card into its owner's EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { FAIRY, mayGoToExLastWords, pixieTokensHaveRush } from "./shared";

export default defineCard({
  playableIf: (g, self) => g.playZone(self) !== "ex",
  field: { keywordsFor: pixieTokensHaveRush },
  exPassives: { keywordsFor: pixieTokensHaveRush },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY]);
      },
    }),
    mayGoToExLastWords,
  ],
});
