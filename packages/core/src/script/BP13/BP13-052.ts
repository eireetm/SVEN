// BP13-052 Arcane Duplication — Runecraft spell, 2. 魔法使い.
// Select a card in your cemetery. Banish it, search your deck for a card with the same cost and card type,
// reveal it, add it to your hand, then shuffle. (元のコスト and card type of the selected card.)
import { defineCard, spell } from "../helpers";
import { inYourZone } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery")],
      *resolve(fx) {
        const card = fx.targets[0]![0]!;
        if (fx.game.card(card)?.zone !== "cemetery") return;
        const { cost, type } = fx.game.info(card);
        yield* fx.banish([card]);
        yield* fx.search((id) => fx.game.info(id).cost === cost && fx.game.info(id).type === type);
      },
    }),
  ],
});
