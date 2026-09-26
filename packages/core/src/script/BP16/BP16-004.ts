// BP16-004 Nazuri, Bestial Innkeeper — Forestcraft follower, 3, 2/2. 宴楽・獣.
// {[fanfare]} If there are at least 3 Festive cards on your field and/or in your EX area, search your deck for a
// Festive follower not named Nazuri, Bestial Innkeeper that costs 3 or less, summon it, then shuffle. (Counted
// together — ruling; this one counts; 元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, isFollower, named } from "../targets";
import { countIn, festive } from "./shared";

const found = and(isFollower, festive, costAtMost(3));

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => countIn(g, p, "field", festive) + countIn(g, p, "ex", festive) >= 3,
      *resolve(fx) {
        yield* fx.search((id) => found(fx.game, id) && !named("Nazuri, Bestial Innkeeper")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
