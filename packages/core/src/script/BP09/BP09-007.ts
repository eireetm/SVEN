// BP09-007 Wrath of Nature — Forestcraft spell, 4. 精霊・植物族・キラー.
// Deal 3 damage to each enemy follower on the field. If there are at least 5 {[forestcraft]} spells
// with different names in your cemetery, deal 5 damage instead and deal 2 damage to each enemy leader.
// (This spell is not in the cemetery while it resolves — ruling. The leader damage is part of the
// condition as the English says; the Japanese "…なら、代わりに5ダメージ。相手のリーダーすべてに2ダメージ。"
// allows that reading, docs/open-questions.md.)
import { defineCard, spell } from "../helpers";
import { fiveForestSpellNames } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        const five = fiveForestSpellNames(fx.game, fx.controller);
        yield* fx.dealDamageEach(fx.game.followers(opp), five ? 5 : 3);
        if (five) yield* fx.dealDamageEach([fx.game.leader(opp)], 2);
      },
    }),
  ],
});
