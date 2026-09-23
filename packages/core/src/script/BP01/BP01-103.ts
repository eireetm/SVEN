// BP01-103 Lord Atomy — Abysscraft follower, 9, 6/6.
// When playing this card, put 4 reserved {[abysscraft]} cards from your field into their owners'
// cemeteries, or banish 4 {[abysscraft]} cards in your EX area: This card costs 9 less to play.
// (CR 10.4.7.3. Tokens count; field and EX cannot be mixed; paying frees the field first, so a
// full field is fine — rulings.)
import { defineCard } from "../helpers";
import type { GameReader } from "../../engine/query";
import type { CardId, PlayerId } from "../../model/ids";

const abyss = (g: GameReader, id: CardId) => g.info(id).class === "Abysscraft";
const reservedAbyssOnField = (g: GameReader, c: PlayerId) => g.cards(c, "field").filter((id) => abyss(g, id) && !g.card(id)!.engaged);
const abyssInEx = (g: GameReader, c: PlayerId) => g.cards(c, "ex").filter((id) => abyss(g, id));

export default defineCard({
  playOptions: [
    {
      id: "bury4",
      label: "Put 4 reserved Abysscraft cards from your field into the cemetery: costs 9 less",
      canPay: (g, c) => reservedAbyssOnField(g, c).length >= 4,
      costDelta: -9,
      freesFieldSlots: 4,
      *pay(fx) {
        yield* fx.bury(yield* fx.chooseCards(reservedAbyssOnField(fx.game, fx.controller), 4, 4));
      },
    },
    {
      id: "banish4",
      label: "Banish 4 Abysscraft cards in your EX area: costs 9 less",
      canPay: (g, c) => abyssInEx(g, c).length >= 4,
      costDelta: -9,
      *pay(fx) {
        yield* fx.banish(yield* fx.chooseCards(abyssInEx(fx.game, fx.controller), 4, 4));
      },
    },
  ],
});
