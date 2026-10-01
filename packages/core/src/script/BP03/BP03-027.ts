// BP03-027 Young Ogrehunter Momo — Swordcraft follower, 4, 5/5. 兵士・童話.
// Assail.
// {[fanfare]} If another Fable follower is on your field, give this Rush.
// Follower Strike: If the enemy follower has 5 defense or less, draw a card, then discard a card.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare, followerStrike } from "../helpers";
import { hasTrait } from "../targets";

const otherFable = (g: GameReader, self: CardId) =>
  g.followers(g.controller(self)).some((id) => id !== self && hasTrait("童話")(g, id));

export default defineCard({
  keywords: ["assail"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (otherFable(fx.game, fx.self)) yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
    followerStrike({
      *resolve(fx) {
        if (fx.event?.type !== "attackDeclared") return;
        // A follower that has left the field (e.g. destroyed by another Strike the player chose
        // to resolve first, CR 10.7.3.1) is no longer "the enemy follower": the condition is not
        // met (confirmed by a judge).
        const target = fx.event.target;
        if (fx.game.card(target)?.zone !== "field" || (fx.game.info(target).defense ?? 99) > 5) return;
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
