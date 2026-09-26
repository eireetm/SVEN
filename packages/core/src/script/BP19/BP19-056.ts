// BP19-056 Antemaria, Huntress Convict — Dragoncraft follower, 6, 6/5. 八獄・ドラゴニュート.
// This can't be played from the EX area.
// {[fanfare]} Bury 2 Condemned cards in your EX area: Give this Storm and Drain. (CR 10.4.7.4.)
// {[lastwords]} Put this into its owner's EX area.
import { defineCard, fanfare } from "../helpers";
import { backToEx, buryCondemnedFromEx, notFromEx } from "./shared-dragon";

export default defineCard({
  playableIf: notFromEx,
  abilities: [
    fanfare({
      cost: buryCondemnedFromEx(2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveKeyword(fx.self, "storm");
        yield* fx.giveKeyword(fx.self, "drain");
      },
    }),
    backToEx,
  ],
});
