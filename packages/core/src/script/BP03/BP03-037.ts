// BP03-037 Heroic Entry — Swordcraft spell, 3. 兵士・ヒーロー.
// Look at the top 4. You may put a Swordcraft follower costing 3 or less onto your field.
// If it is Heroic, give it +1/+1. Put the rest on the bottom in any order.
import { defineCard, spell } from "../helpers";
import { hasTrait, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(4);
        const matching = top.filter(
          (id) => isFollower(fx.game, id) && isClass("Swordcraft")(fx.game, id) && (fx.game.info(id).cost ?? 99) <= 3,
        );
        const [chosen] = yield* fx.selectCards(matching, 0, 1, fx.controller, top);
        if (chosen) {
          const [id] = yield* fx.putOntoField([chosen]);
          if (id && hasTrait("ヒーロー")(fx.game, id)) yield* fx.giveStats(id, 1, 1);
        }
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
