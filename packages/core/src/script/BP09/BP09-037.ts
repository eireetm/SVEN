// BP09-037 Faust, Truthseeker — Runecraft follower, 5, 4/4. 錬金術師.
// {[fanfare]} Search your deck for up to 2 Earth Sigil amulets that cost a total of 4 or less, put
// them into your EX area, then shuffle your deck. They cost 0 to play this turn. (元のコスト. With room
// for one, one of the found cards goes and the other stays in the deck; none may be found — ruling.)
// At the start of your end phase, Earth Rite: Select a follower on your field. Give it
// {[attack]}+1/{[defense]}+1 and deal 2 damage to each enemy leader.
import { atStartOfYourEndPhase, defineCard, fanfare, selectWithinTotalCost } from "../helpers";
import { and, hasTrait, isAmulet, yourFollower } from "../targets";

const earthSigilAmulet = and(isAmulet, hasTrait("土の印"));

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        // CR 5.8 — look through the deck, choose, reveal, move, shuffle.
        const deck = fx.game.cards(fx.controller, "deck");
        const chosen = yield* selectWithinTotalCost(fx, deck.filter((id) => earthSigilAmulet(fx.game, id)), 4, 2, deck);
        yield* fx.reveal(chosen);
        const moved = yield* fx.putIntoEx(chosen);
        yield* fx.shuffleDeck();
        for (const id of moved) yield* fx.setPlayCost(id, 0, "endOfTurn");
      },
    }),
    atStartOfYourEndPhase({
      earthRite: { mode: "required" },
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 2);
      },
    }),
  ],
});
