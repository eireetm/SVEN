// BP07-016 Marvelously Mad Matter — Forestcraft follower, 2, 2/3. 童話.
// {[fanfare]} If there's another Fable card on your field, search your deck for a Fable follower,
// put it into your EX area, then shuffle your deck. You may place a Fable counter on that follower.
// (A card in the EX area keeps its counters when it is put or played onto the field — BP03-102
// ruling, CR 4.8.3.3.)
import { defineCard, fanfare } from "../helpers";
import { and, isFollower } from "../targets";
import { fable } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.cards(fx.controller, "field").some((id) => id !== fx.self && fable(fx.game, id))) return;
        const [found] = yield* fx.search((id) => and(isFollower, fable)(fx.game, id), { to: "ex" });
        if (found === undefined || fx.game.card(found)?.zone !== "ex") return;
        if (yield* fx.confirm(fx.controller, found)) yield* fx.addCounters(found, "fable", 1);
      },
    }),
  ],
});
