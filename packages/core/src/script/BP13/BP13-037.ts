// BP13-037 Ghios, Sparkling Prism — Runecraft follower, 3, 3/3. 魔法使い.
// At the start of your end phase, if you played a Mage follower and a Mage spell this turn, place a mana
// counter on this card in your EX area. (Valid in the EX area, CR 10.3.5.)
// ----------
// {[evolve]} {[cost04]}: Evolve this follower.
// {[act]} {[cost00]}: Put this card from your hand into your EX area. If there are at least 5 Mage followers
// and at least 5 Mage spells in your cemetery, place a mana counter on this card in your EX area. (Valid
// in the hand — ruling. The counters stay on it when it is played, CR 10.6.2.1.3.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { activated, atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { and, isFollower, isSpell } from "../targets";
import { countIn, hasRoom, mage } from "./shared";

const playedMageFollowerAndSpell = (g: GameReader, p: PlayerId): boolean => {
  const played = g.cardsPlayedThisTurn(p).map((def) => g.db.get(def));
  const mageOf = (type: string) => played.some((d) => d.type === type && d.traits.includes("魔法使い"));
  return mageOf("follower") && mageOf("spell");
};

/** "Put this card from your hand into your EX area" — the card there is remembered for the effect. */
const putThisIntoEx: CustomCost = {
  canPay: (g, c, self) => g.card(self)?.zone === "hand" && hasRoom(g, c, "ex"),
  *pay(fx) {
    const [moved] = yield* fx.putIntoEx([fx.self]);
    fx.memory.inEx = moved ?? null;
  },
};

export default defineCard({
  abilities: [
    {
      ...atStartOfYourEndPhase({
        condition: playedMageFollowerAndSpell,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "ex") yield* fx.addCounters(fx.self, "mana", 1);
        },
      }),
      validIn: ["ex"],
    },
    evolveAbility(4),
    activated(
      { custom: putThisIntoEx },
      {
        validIn: ["hand"],
        *resolve(fx) {
          const card = fx.memory.inEx;
          if (typeof card !== "string" || fx.game.card(card)?.zone !== "ex") return;
          const g = fx.game;
          if (countIn(g, fx.controller, "cemetery", and(isFollower, mage)) >= 5 && countIn(g, fx.controller, "cemetery", and(isSpell, mage)) >= 5) {
            yield* fx.addCounters(card, "mana", 1);
          }
        },
      },
    ),
  ],
});
