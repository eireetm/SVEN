// CP04-053 Chellerific Carnival — Runecraft spell, 2. プリコネ・なかよし部.
// {[quick]}
// Select an enemy follower on the field. Deal it 3 damage and, if there's a Friendship Club follower on your field, draw a card.
// (Without an enemy follower it can't be played — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { followerThat, friendshipClub } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        if (fx.game.followers(fx.controller).some((id) => followerThat(friendshipClub)(fx.game, id))) yield* fx.draw(1);
      },
    }),
  ],
});
