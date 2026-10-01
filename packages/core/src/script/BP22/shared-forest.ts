// Shared pieces of BP22 Forestcraft card scripts (not a card: the file name has no set prefix).
import { whenFollowerEntersYourField } from "../helpers";
import { named } from "../targets";
import { crystalia, ERIN } from "./shared";

/**
 * "自分の場に「これと同名を除くクリスタリア・フォロワー」が出たとき、それは進化する。" (BP22-003 / 004): an effect evolves it — no
 * evolve cost paid, and its player may choose not to evolve it (rulings; fx.evolve, BP03-021 ruling).
 */
export const erinEvolvesCrystalia = whenFollowerEntersYourField(
  {
    *resolve(fx) {
      const card = fx.data?.card;
      if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.evolve(card);
    },
  },
  { filter: (g, id) => crystalia(g, id) && !named(ERIN)(g, id) },
);
