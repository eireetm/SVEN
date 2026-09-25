// BP09-001 Yggdrasil — Forestcraft follower, 5, 3/5. 精霊・植物族.
// {[fanfare]} Search your deck for a {[forestcraft]} spell, reveal it, add it to your hand, then
// shuffle your deck.
// {[act]} {[cost01]}: Select a {[forestcraft]} spell that costs X or less in your cemetery and put it
// into your EX area. It costs 0 to play this turn. X equals the number of {[forestcraft]} spells with
// different names in your cemetery. Activate only once per turn. (元のコスト; the selected spell
// counts for X.)
import { activated, defineCard, fanfare } from "../helpers";
import { inYourZone } from "../targets";
import { forestSpell, forestSpellNames } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => forestSpell(fx.game, id));
      },
    }),
    activated(
      { playPoints: 1 },
      {
        oncePerTurn: true,
        targets: [
          inYourZone("cemetery", {
            filter: (g, id) => forestSpell(g, id) && (g.info(id).cost ?? Infinity) <= forestSpellNames(g, g.controller(id)),
          }),
        ],
        *resolve(fx) {
          const [card] = yield* fx.putIntoEx(fx.targets[0]!);
          if (card !== undefined) yield* fx.setPlayCost(card, 0, "endOfTurn");
        },
      },
    ),
  ],
});
