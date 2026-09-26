// BP11 Abysscraft abilities shared by a card and its evolved card (not a card).
import type { AutomaticAbility } from "../types";
import { lastWords } from "../helpers";
import { BIKE } from "./shared";

/** BP11-076 / 077 / 082 "{[lastwords]} Summon a Bullet Bike token. Bury the top [n] cards of your deck." */
export const bikeAndBury = (n: number): AutomaticAbility =>
  lastWords({
    *resolve(fx) {
      yield* fx.summon([BIKE]);
      yield* fx.mill(n);
    },
  });
