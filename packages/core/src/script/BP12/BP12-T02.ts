// BP12-T02 Twilight Blade — Swordcraft spell token, 5. 指揮官・兵士.
// As an additional cost to play this card, engage a Lecia, Sky Saber and Nano, the Dawnblade on your
// field.
// ----------
// Deal 10 damage to each enemy leader and enemy follower on the field.
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { defineCard, spell } from "../helpers";
import { named } from "../targets";
import { LECIA, NANO } from "./shared";

/** Reserved cards named `name` on your field (only those can be engaged, CR 5.4). */
const reserved = (g: GameReader, p: PlayerId, name: string): CardId[] =>
  g.cards(p, "field").filter((id) => g.card(id)?.engaged === false && named(name)(g, id));

const engageLeciaAndNano: CustomCost = {
  canPay: (g, c) => reserved(g, c, LECIA).length > 0 && reserved(g, c, NANO).length > 0,
  *pay(fx) {
    const [lecia] = yield* fx.chooseCards(reserved(fx.game, fx.controller, LECIA), 1, 1);
    const [nano] = yield* fx.chooseCards(reserved(fx.game, fx.controller, NANO), 1, 1);
    yield* fx.engage([lecia, nano].filter((id): id is CardId => id !== undefined));
  },
};

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "engage", label: "Engage a Lecia, Sky Saber and a Nano, the Dawnblade on your field", ...engageLeciaAndNano }],
  abilities: [
    spell({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], 10);
      },
    }),
  ],
});
