// ECP01-043 Air Shakur — Abysscraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// While there are at least 20 Umamusume cards in your cemetery, this follower has Storm and "Strike - Give this follower
// {[attack]}+3/{[defense]}+3." (A passive ability: gained and lost as the count changes; an attack already declared goes on after
// losing Storm; not valid outside the field — rulings.)
// On Race - Select up to 1 enemy follower on the field and deal it 3 damage. Give this follower {[attack]}+1/{[defense]}+1 and
// bury the top 2 cards of your deck.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, onRace, serveAbility, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { damageUpToOneThenPlusOne } from "./shared";

// typeAndTraits (not info): also read inside the keyword passive.
const twenty = (g: GameReader, p: PlayerId) => g.cards(p, "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("ウマ娘")).length >= 20;

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => (card === self && twenty(g, g.controller(self)) ? ["storm"] : []),
  },
  abilities: [
    serveAbility(1, 1),
    // The given Strike: it has it while the condition holds, so it triggers only then.
    strike({
      triggerIf: (g, c) => twenty(g, c),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 3, 3);
      },
    }),
    onRace({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        yield* damageUpToOneThenPlusOne(fx, 3);
        yield* fx.mill(2);
      },
    }),
  ],
});
