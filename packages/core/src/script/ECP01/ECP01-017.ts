// ECP01-017 Biwa Hayahide — Swordcraft follower, 5, 4/4. ウマ娘・BNW.
// {[feed]} {[cost01]}: Race this follower.
// Ward.
// On Race - Give this follower {[attack]}+1/{[defense]}+1. Search your deck for up to 3 BNW cards with different names, put
// them into your EX area, then shuffle. They cost 3 less to play this turn.
import { defineCard, onRace, serveAbility } from "../helpers";
import { bnw, plusOneThis } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        yield* plusOneThis(fx);
        const found = yield* fx.search((id) => bnw(fx.game, id), { max: 3, distinctNames: true, to: "ex" });
        for (const id of found) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -3, "endOfTurn");
      },
    }),
  ],
});
