// CP04-047 Chieru — Runecraft follower, 2, 2/3. プリコネ・なかよし部.
// {[ub]}{[fanfare]} Look at the top 4 cards of your deck. You may reveal a Friendship Club card or PriConne spell from among them
// and add it to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards, ub } from "../helpers";
import { friendshipClub, priconneSpell } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          yield* lookAtTopCards(fx, 4, { filter: (g, id) => friendshipClub(g, id) || priconneSpell(g, id), to: "hand" });
        },
      }),
    ),
  ],
});
