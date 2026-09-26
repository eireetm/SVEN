import type { CardId, PlayerId } from "../model/ids";
import type { GameReader } from "../engine/query";
import type { CustomCost } from "./types";

/**
 * Reusable costs ("[cost]: [effect]"). Costs are paid from your own zones only (BP01-123
 * ruling), and selecting cards for a cost is not the ability "selecting" them, so Aura does
 * not apply.
 */
type Filter = (game: GameReader, card: CardId) => boolean;

/** "Return another [matching] card on your field to its owner's hand" (e.g. BP03-002: a follower). */
export function returnAnotherFromYourField(filter: Filter = () => true): CustomCost {
  return {
    canPay: (g, c, self) => g.cards(c, "field").some((id) => id !== self && filter(g, id)),
    *pay(fx) {
      const cards = fx.game.cards(fx.controller, "field").filter((id) => id !== fx.self && filter(fx.game, id));
      yield* fx.returnToHand(yield* fx.chooseCards(cards, 1, 1));
    },
  };
}

/** "Return another card on your field to its owner's hand" (BP01-002 / 003). */
export const returnAnotherCardOnYourField: CustomCost = returnAnotherFromYourField();

/**
 * "Bury another [matching] card" — on your field (CR 10.4.3: a cost's unspecified zone is its
 * controller's), e.g. BP09-071 "Bury another follower", BP09-096 "Bury another amulet".
 */
export function buryAnotherFromYourField(filter: Filter = () => true): CustomCost {
  return {
    canPay: (g, c, self) => g.cards(c, "field").some((id) => id !== self && filter(g, id)),
    *pay(fx) {
      const cards = fx.game.cards(fx.controller, "field").filter((id) => id !== fx.self && filter(fx.game, id));
      yield* fx.bury(yield* fx.chooseCards(cards, 1, 1));
    },
  };
}

/**
 * CR 10.4.6 "{[engage]}" (this card) as the process of an automatic ability, "when [event],
 * {[engage]}: [effect]" (10.4.7.4, BP09-092): engage this card if it is on the field reserved.
 */
export const engageThis: CustomCost = {
  canPay: (g, _c, self) => g.card(self)?.zone === "field" && g.card(self)?.engaged === false,
  *pay(fx) {
    yield* fx.engage([fx.self]);
  },
};

/** "Banish this card from your cemetery" — a cost of an ability valid in the cemetery (BP09-024 / 105, CR 10.3.5). */
export const banishThisFromCemetery: CustomCost = {
  canPay: (g, _c, self) => g.card(self)?.zone === "cemetery",
  *pay(fx) {
    yield* fx.banish([fx.self]);
  },
};

/** "Banish this card from your EX area", with `validIn: ["ex"]` (e.g. BP12-095). */
export const banishThisFromEx: CustomCost = {
  canPay: (g, _c, self) => g.card(self)?.zone === "ex",
  *pay(fx) {
    yield* fx.banish([fx.self]);
  },
};

/**
 * "Put this card from your hand into your EX area" — a cost of an ability valid in the hand
 * (BP08-072, BP10-017). Impossible with a full EX area (CR 4.8.3.2, 10.4.2.2; BP10-017 ruling).
 */
export const putThisFromHandIntoEx: CustomCost = {
  canPay: (g, c, self) => g.card(self)?.zone === "hand" && g.cards(c, "ex").length < g.exAreaLimit(c),
  *pay(fx) {
    yield* fx.putIntoEx([fx.self]);
  },
};

/**
 * "Bury this card" (this card on the field) as the process of an automatic ability or an option,
 * e.g. BP10-019 "(4) {[cost04]}, bury this card: ..." (CR 10.4.7.5).
 */
export const buryThis: CustomCost = {
  canPay: (g, _c, self) => g.card(self)?.zone === "field",
  *pay(fx) {
    yield* fx.bury([fx.self]);
  },
};

/** "Banish this" — this card on the field (BP14-018, 070: an advanced activated ability's cost). */
export const banishThis: CustomCost = {
  canPay: (g, _c, self) => g.card(self)?.zone === "field",
  *pay(fx) {
    yield* fx.banish([fx.self]);
  },
};

/** "Discard this card" — a cost of an ability valid in the hand (BP08-037, 105; CR 10.3.5, 5.12). */
export const discardThis: CustomCost = {
  canPay: (g, _c, self) => g.card(self)?.zone === "hand",
  *pay(fx) {
    yield* fx.discardCards([fx.self]);
  },
};

/**
 * "Discard a [matching] card" from your hand — another card than this one: a card being played is in the
 * resolution zone when its costs are paid (CR 10.6.2.1, e.g. BP14-119, itself a Goblinoid card).
 */
export function discardA(filter: Filter): CustomCost {
  return {
    canPay: (g, c, self) => g.cards(c, "hand").some((id) => id !== self && filter(g, id)),
    *pay(fx) {
      const cards = fx.game.cards(fx.controller, "hand").filter((id) => id !== fx.self && filter(fx.game, id));
      yield* fx.discardCards(yield* fx.chooseCards(cards, 1, 1));
    },
  };
}

/**
 * "Put N [matching] cards from your field into their owner's cemetery" (may include this card
 * itself, e.g. BP07-T01), all at once.
 */
export function buryFromYourField(filter: Filter, n = 1): CustomCost {
  return {
    canPay: (g, c) => g.cards(c, "field").filter((id) => filter(g, id)).length >= n,
    *pay(fx) {
      const cards = fx.game.cards(fx.controller, "field").filter((id) => filter(fx.game, id));
      yield* fx.bury(yield* fx.chooseCards(cards, n, n));
    },
  };
}

/** "Banish N [matching] cards in your EX area". */
export function banishFromYourEx(filter: Filter, n = 1): CustomCost {
  return banishFromYour(["ex"], filter, n);
}

/**
 * "Banish N [matching] cards from your [field / EX area / cemetery]", e.g. BP07-013 "Banish a
 * Naterran Great Tree from your field", BP07-104 "... from your field or EX area", BP07-069
 * "Banish 2 Machina cards from your cemetery". All at once.
 */
export function banishFromYour(zones: readonly ("field" | "ex" | "cemetery")[], filter: Filter, n = 1): CustomCost {
  const cards = (g: GameReader, c: PlayerId) => zones.flatMap((z) => g.cards(c, z)).filter((id) => filter(g, id));
  return {
    canPay: (g, c) => cards(g, c).length >= n,
    *pay(fx) {
      yield* fx.banish(yield* fx.chooseCards(cards(fx.game, fx.controller), n, n));
    },
  };
}

/**
 * "{[engage]} N [matching] cards on your field" (CR 10.4.6: reserved ones), e.g. BP07-020 "2
 * cards named Naterran Great Tree", BP06-017 "2 Hunter followers".
 */
export function engageYourCards(filter: Filter, n = 1): CustomCost {
  const reserved = (g: GameReader, c: PlayerId) => g.cards(c, "field").filter((id) => g.card(id)?.engaged === false && filter(g, id));
  return {
    canPay: (g, c) => reserved(g, c).length >= n,
    *pay(fx) {
      yield* fx.engage(yield* fx.chooseCards(reserved(fx.game, fx.controller), n, n));
    },
  };
}

/**
 * Several costs paid together, in the listed order (CR 10.4.2.1), e.g. BP07-117 "{[cost01]}, banish a
 * Naterran Great Tree from your field or EX area". Payable only if every part is (CR 10.4.2.2).
 */
export function allCosts(...costs: readonly CustomCost[]): CustomCost {
  return {
    canPay: (g, c, self) => costs.every((cost) => cost.canPay(g, c, self)),
    *pay(fx) {
      for (const cost of costs) yield* cost.pay(fx);
    },
  };
}

/** A play-point cost of an automatic ability, e.g. "{[fanfare]} {[cost03]} ..." (CR 10.4.4, 10.4.7.4). */
export function playPointsCost(n: number): CustomCost {
  return {
    canPay: (g, c) => g.state.players[c].playPoints >= n,
    *pay(fx) {
      yield* fx.payPlayPoints(n);
    },
  };
}

/** "Discard N cards" from your hand (CR 5.12), e.g. BP02-089 "Evolve Discard 3 cards". */
export function discardCardsCost(n: number): CustomCost {
  return {
    canPay: (g, c) => g.cards(c, "hand").length >= n,
    *pay(fx) {
      yield* fx.discardCards(yield* fx.chooseCards(fx.game.cards(fx.controller, "hand"), n, n));
    },
  };
}

/**
 * "Reveal N [matching] cards from your hand" (CR 5.21), e.g. BP15-041 "When playing this, reveal 2 Onmyoji
 * cards from your hand". Other cards than this one: a card being played is in the resolution zone when
 * its costs are paid (CR 10.6.2.1; BP15-041 is itself an Onmyoji card).
 */
export function revealFromHand(filter: Filter, n: number): CustomCost {
  const cards = (g: GameReader, c: PlayerId, self: CardId) => g.cards(c, "hand").filter((id) => id !== self && filter(g, id));
  return {
    canPay: (g, c, self) => cards(g, c, self).length >= n,
    *pay(fx) {
      yield* fx.reveal(yield* fx.chooseCards(cards(fx.game, fx.controller, fx.self), n, n));
    },
  };
}

/** "Give your leader -X defense" as a cost (CR 10.4.5: needs at least X; BP01-119 ruling). */
export function leaderDefenseCost(x: number): CustomCost {
  return {
    canPay: (g, c) => g.state.players[c].leaderDefense >= x,
    *pay(fx) {
      yield* fx.giveLeaderDefense(fx.controller, -x);
    },
  };
}
