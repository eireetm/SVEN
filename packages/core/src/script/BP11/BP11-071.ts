// BP11-071 Illganeau, Horror Astray — Abysscraft follower, 1, 1/1. 荒野・死者・魔界.
// {[fanfare]} Select a Wasteland follower that costs 3 or less in your cemetery. Necrocharge (10) - You
// may summon it. If you do, banish this card. (It may select itself in the cemetery, and is then not
// banished; not on the field any more, it isn't banished either — rulings.)
// {[lastwords]} Put this card into its owner's EX area. Bury the top card of your deck. (A full EX area
// leaves it in the cemetery — ruling.)
import { defineCard, fanfare, lastWords } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { wastelandFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(wastelandFollower, costAtMost(3)) })],
      *resolve(fx) {
        if (!fx.game.necrocharge(fx.controller, 10) || !(yield* fx.confirm())) return;
        const summoned = yield* fx.putOntoField(fx.targets[0]!);
        if (summoned.length > 0 && fx.game.card(fx.self)?.zone === "field") yield* fx.banish([fx.self]);
      },
    }),
    lastWords({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
        yield* fx.mill(1);
      },
    }),
  ],
});
