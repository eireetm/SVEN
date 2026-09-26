// BP10-019 VII. Oluon, The Chariot — Swordcraft follower, 3, 3/3. アルカナ・指揮官.
// {[fanfare]} Choose one. (1) Summon a Knight token. (2) Give this follower {[attack]}+1, Rush, and
// Ward. (3) Deal 2 damage to each enemy leader. (4) {[cost04]}, bury this card: You may summon a VII.
// Oluon, Runaway Chariot from your evolve deck. ((1) also with a full field — ruling. (4)'s process is
// asked when it resolves, CR 10.4.7.5; the Runaway Chariot is an advanced card, CR 9.2.)
import { allCosts, buryThis, playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "knight",
          label: "(1) Summon a Knight token",
          *resolve(fx) {
            yield* fx.summon(["Knight"]);
          },
        },
        {
          id: "buff",
          label: "(2) This follower gets +1 attack, Rush and Ward",
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone !== "field") return;
            yield* fx.giveStats(fx.self, 1, 0);
            yield* fx.giveKeyword(fx.self, "rush");
            yield* fx.giveKeyword(fx.self, "ward");
          },
        },
        {
          id: "leader",
          label: "(3) Deal 2 damage to each enemy leader",
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
          },
        },
        {
          id: "chariot",
          label: "(4) Pay 4 and bury this card: you may summon VII. Oluon, Runaway Chariot from your evolve deck",
          cost: allCosts(playPointsCost(4), buryThis),
          *resolve(fx) {
            yield* fx.fromEvolveDeck((id) => named("VII. Oluon, Runaway Chariot")(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
