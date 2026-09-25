// BP09-036 Ceridwen, Eternity Hunter (Evolved) — Runecraft follower, 4/4. 錬金術師・禁忌.
// On Evolve - Earth Rite: Put an Eternal Potion token into your EX area.
// While this card is on your field, the 1st Forbidden token you play each turn costs 2 less.
// (A Forbidden token played earlier that turn, even before it evolved, was that turn's first; two
// of them make it 4 less — rulings. Like BP04-022.)
import { defineCard, onEvolve } from "../helpers";

const forbiddenToken = (token: boolean, traits: readonly string[]) => token && traits.includes("禁忌");

export default defineCard({
  field: {
    playCostOf: (g, self, card, player) =>
      player === g.controller(self) &&
      forbiddenToken(g.info(card).baseDef.token, g.info(card).traits) &&
      !g.cardsPlayedThisTurn(player).some((def) => forbiddenToken(g.db.get(def).token, g.db.get(def).traits))
        ? -2
        : 0,
  },
  abilities: [
    onEvolve({
      earthRite: { mode: "required" },
      *resolve(fx) {
        yield* fx.tokensToEx(["Eternal Potion"]);
      },
    }),
  ],
});
