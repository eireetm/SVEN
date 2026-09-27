// CP04-039 Yuni — Runecraft follower, 5, 4/4. プリコネ・なかよし部.
// {[ub]}{[fanfare]} Search your deck for up to 2 Friendship Club cards with different names that cost 2 or less, put them into your
// EX area, then shuffle. They cost 2 less to play this turn. (元のコスト.)
// Whenever a {[ub]} ability of another follower on your field is executed, the next PriConne spell you play this turn costs 2 less.
// (Twice: 4 less for that spell — ruling; also in an opponent's turn.)
import { defineCard, fanfare, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { costAtMost } from "../targets";
import { cheaperThisTurn, friendshipClub, priconneSpell } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          const g = fx.game;
          const found = yield* fx.search((id) => friendshipClub(g, id) && costAtMost(2)(g, id), { max: 2, to: "ex", distinctNames: true });
          yield* cheaperThisTurn(fx, found, 2);
        },
      }),
    ),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess("priconneSpell", 2);
      },
    }),
  ],
  nextPlay: { priconneSpell: (g, card) => priconneSpell(g, card) },
});
