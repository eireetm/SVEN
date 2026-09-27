// CP04-044 Construct of Truth and Being — Runecraft spell, 2. プリコネ・なかよし部.
// {[quick]}
// Discard a PriConne card: Draw 2 cards. If there's a Friendship Club follower on your field, give your leader {[defense]}+2.
// (A process in its text, CR 10.4.7.5: it can be played with no other card in hand, and then nothing happens — ruling.)
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { followerThat, friendshipClub, priconne } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        if (!(yield* fx.optionalCost(discardA(priconne)))) return;
        yield* fx.draw(2);
        if (fx.game.followers(fx.controller).some((id) => followerThat(friendshipClub)(fx.game, id))) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        }
      },
    }),
  ],
});
