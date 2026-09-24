// BP03-051 Magical Rook — Runecraft follower, 1, 2/2. チェス.
// {[fanfare]} If a Magical Pawn is in your EX area, +1 defense and Ward.
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const pawn = fx.game.cards(fx.controller, "ex").some((id) => named("Magical Pawn")(fx.game, id));
        if (!pawn) return;
        yield* fx.giveStats(fx.self, 0, 1);
        yield* fx.giveKeyword(fx.self, "ward");
      },
    }),
  ],
});
