// BP14-T02 Glittering Gold — Swordcraft spell token, 0. 宴楽・盗賊・財宝.
// {[act]} {[cost01]}, banish this and 2 other cards named Glittering Gold from your EX area: Give your leader
// {[defense]}+1. Draw a card. (Valid in the EX area. Played as a spell it does nothing — ruling.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { activated, defineCard } from "../helpers";
import { named } from "../targets";
import { GLITTERING_GOLD } from "./shared";

const otherGold = (g: GameReader, p: PlayerId, self: CardId): CardId[] =>
  g.cards(p, "ex").filter((id) => id !== self && named(GLITTERING_GOLD)(g, id));

const banishThisAndTwoGold: CustomCost = {
  canPay: (g, c, self) => g.card(self)?.zone === "ex" && otherGold(g, c, self).length >= 2,
  *pay(fx) {
    const two = yield* fx.chooseCards(otherGold(fx.game, fx.controller, fx.self), 2, 2);
    yield* fx.banish([fx.self, ...two]);
  },
};

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, custom: banishThisAndTwoGold },
      {
        validIn: ["ex"],
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
