// BP12-066 Ruinous Dragon — Dragoncraft follower, 7, 5/5. 竜族.
// {[fanfare]} Search your deck for a {[dragoncraft]} spell that costs 5 or less or a non-{[dragoncraft]}
// spell that costs 2 or less, put it into your EX area, then shuffle. It costs 5 less to play this turn.
// (元のコスト. Its own cost increases apply first — ruling.)
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";
import { costAtMost, isClass, isSpell } from "../targets";

const searchable = (g: GameReader, id: CardId): boolean =>
  isSpell(g, id) && (isClass("Dragoncraft")(g, id) ? costAtMost(5)(g, id) : costAtMost(2)(g, id));

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const id of yield* fx.search((card) => searchable(fx.game, card), { to: "ex" })) {
          yield* fx.changePlayCost(id, -5, "endOfTurn");
        }
      },
    }),
  ],
});
