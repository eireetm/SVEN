// CP03-100 Abyss Healer — Abysscraft follower, 2, 2/3. ヴァンガード・シャドウパラディン. Heal Trigger.
// Ward.
// {[fanfare]} If there are at least 10 Shadow Paladin cards in your cemetery, give your leader {[defense]}+3.
// ----------
// (If this card is revealed by a drive check, give your leader {[defense]}+3.) (Resolved by the engine.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";
import { countIn, shadowPaladin } from "./shared";

const tenShadowPaladins = (g: GameReader, p: PlayerId) => countIn(g, p, "cemetery", shadowPaladin) >= 10;

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      condition: (g, c) => tenShadowPaladins(g, c),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
