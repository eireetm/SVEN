// CP01-032 Zenno Rob Roy — Runecraft follower, 1, 0/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Whenever another one of your followers races, look at the top 4 cards of your deck. You may reveal a spell or amulet from
// among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order. (Once per race: racing
// 3 times triggers it 3 times — ruling.)
import { defineCard, lookAtTopCards, serveAbility, whenYourFollowerRaces } from "../helpers";
import { isAmulet, isSpell } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    whenYourFollowerRaces(
      {
        *resolve(fx) {
          yield* lookAtTopCards(fx, 4, { filter: (g, id) => isSpell(g, id) || isAmulet(g, id), to: "hand" });
        },
      },
      { another: true },
    ),
  ],
});
