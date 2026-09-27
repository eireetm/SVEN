// CP03-066 Blazing Core Dragon — Dragoncraft follower, 3, 3/3. ヴァンガード・かげろう.
// {[evolve]} {[cost03]}: Evolve this follower into a Blazing Flare Dragon.
// {[evolve]} {[cost01]}, banish an Iron Tail Dragon and Gattling Claw Dragon from your cemetery: Evolve this follower into a
// Blazing Flare Dragon. (The English names are misspelled: the cards are CP03-080 Irontail Dragon and CP03-077 Gatling Claw
// Dragon, as in Japanese アイアンテイル・ドラゴン / ガトリングクロー・ドラゴン.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { defineCard, evolveAbility } from "../helpers";
import { named } from "../targets";

const FLARE = "Blazing Flare Dragon";
const PAIR = ["Irontail Dragon", "Gatling Claw Dragon"] as const;
const inCemetery = (g: GameReader, p: PlayerId, name: string): CardId[] =>
  g.cards(p, "cemetery").filter((id) => named(name)(g, id) && g.banishableByAbilities(id));

const banishPair: CustomCost = {
  canPay: (g, c) => PAIR.every((name) => inCemetery(g, c, name).length > 0),
  *pay(fx) {
    const chosen: CardId[] = [];
    for (const name of PAIR) chosen.push(...(yield* fx.chooseCards(inCemetery(fx.game, fx.controller, name), 1, 1)));
    yield* fx.banish(chosen);
  },
};

export default defineCard({
  abilities: [evolveAbility(3, { into: [FLARE] }), evolveAbility({ playPoints: 1, custom: banishPair }, { into: [FLARE] })],
});
